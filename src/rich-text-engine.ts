import Konva from "konva";
import {
  RichTextDocument,
  TextBlock,
  TextRun,
  FormattingState,
  TextShadow,
  GradientFill,
  DocumentCurve,
} from "./types";

interface LaidOutWord {
  text: string;
  width: number;
  run: TextRun;
  block: TextBlock;
  isSpace: boolean;
}

interface LaidOutLine {
  words: LaidOutWord[];
  width: number;
  height: number;
  ascent: number;
  y: number;
  block: TextBlock;
  isFirstLineOfBlock: boolean;
  blockIndex: number;
}

export interface NodeAnimationState {
  shimmerProgress?: number;
  glowPulse?: number;
  typewriterChars?: number;
  glitchOffset?: { x: number; y: number };
}

export class RichTextNode extends Konva.Shape {
  private doc: RichTextDocument;
  private laidOutLines: LaidOutLine[] = [];
  private totalHeight = 100;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private animState: NodeAnimationState = {};

  constructor(config: {
    x?: number;
    y?: number;
    width?: number;
    document: RichTextDocument;
    draggable?: boolean;
    name?: string;
    id?: string;
  }) {
    super({
      x: config.x ?? 50,
      y: config.y ?? 50,
      width: config.width ?? 400,
      draggable: config.draggable ?? true,
      name: config.name,
      id: config.id,
    });

    this.doc = structuredClone(config.document);
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d")!;

    this.sceneFunc((context, shape) => {
      this.renderCanvas(context);
    });

    // Provide robust, full bounding-box hit detection for effortless clicking/selection
    this.hitFunc((context, shape) => {
      const w = shape.width();
      const h = shape.height();
      context.beginPath();
      if (this.doc.curve?.enabled) {
        context.rect(-10, -20, w + 20, Math.max(h, 120) + 40);
      } else {
        context.rect(-4, -4, w + 8, h + 8);
      }
      context.closePath();
      context.fillStrokeShape(shape);
    });

    this.on("mouseenter", () => {
      const stage = this.getStage();
      if (stage && !stage.container().classList.contains("editing-active")) {
        stage.container().style.cursor = "move";
      }
    });

    this.on("mouseleave", () => {
      const stage = this.getStage();
      if (stage) {
        stage.container().style.cursor = "default";
      }
    });

    this.updateLayout();

    // Listen to transform events to update width/font scale
    this.on("transform", () => {
      const scaleX = this.scaleX();
      const scaleY = this.scaleY();

      if (Math.abs(scaleX - 1) > 0.001 || Math.abs(scaleY - 1) > 0.001) {
        // If scaled proportionally (corner handles)
        const scale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
        this.width(Math.max(40, this.width() * scaleX));
        this.scaleX(1);
        this.scaleY(1);
        this.scaleFontSize(scale);
      }
    });
  }

  public getDocument(): RichTextDocument {
    return structuredClone(this.doc);
  }

  public setDocument(newDoc: RichTextDocument) {
    this.doc = structuredClone(newDoc);
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setAnimationState(state: NodeAnimationState) {
    this.animState = { ...this.animState, ...state };
    this.getLayer()?.batchDraw();
  }

  public clearAnimationState() {
    this.animState = {};
    this.getLayer()?.batchDraw();
  }

  public getTotalCharCount(): number {
    return this.getText().length;
  }

  public getText(): string {
    return this.doc.blocks
      .map((b) => b.content.map((c) => c.text).join(""))
      .join("\n");
  }

  public setText(plainText: string) {
    const lines = plainText.split("\n");
    const firstBlock = this.doc.blocks[0] ?? {
      id: "b-0",
      type: "paragraph",
      blockAttributes: {
        fontSize: 32,
        fontFamily: "Poppins",
        color: "#F8FAFC",
        alignment: "center",
        lineHeight: 1.2,
        letterSpacing: 0,
        paragraphSpacing: 0.4,
      },
      content: [{ text: "", attributes: {} }],
    };

    this.doc.blocks = lines.map((line, idx) => ({
      id: `block-${idx}`,
      type: firstBlock.type,
      blockAttributes: { ...firstBlock.blockAttributes },
      content: [
        {
          text: line,
          attributes: { ...(firstBlock.content[0]?.attributes ?? {}) },
        },
      ],
    }));

    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public updateLayout() {
    const ctx = this.offscreenCtx;
    const boxWidth = Math.max(40, this.width());
    const lines: LaidOutLine[] = [];
    let currentY = 0;
    let listItemCounter = 1;

    for (let bIdx = 0; bIdx < this.doc.blocks.length; bIdx++) {
      const block = this.doc.blocks[bIdx];
      const isList = block.type === "list-item";
      if (!isList) {
        listItemCounter = 1;
      }

      const listIndent = isList ? 28 : 0;
      const usableWidth = Math.max(30, boxWidth - listIndent);

      // Collect words in block
      const words: LaidOutWord[] = [];
      for (const run of block.content) {
        const text = run.text;
        if (!text) continue;

        // Split text by space while preserving tokens
        const tokens = text.split(/(\s+)/);
        for (const token of tokens) {
          if (!token) continue;
          const isSpace = /^\s+$/.test(token);
          this.applyFontToCtx(ctx, block, run);
          const metrics = ctx.measureText(token);
          words.push({
            text: token,
            width: metrics.width + (block.blockAttributes.letterSpacing || 0),
            run,
            block,
            isSpace,
          });
        }
      }

      if (words.length === 0) {
        // Empty paragraph: provide placeholder height
        const fontSize = block.blockAttributes.fontSize || 24;
        const lineH = fontSize * (block.blockAttributes.lineHeight || 1.2);
        lines.push({
          words: [],
          width: 0,
          height: lineH,
          ascent: fontSize * 0.8,
          y: currentY + fontSize * 0.8,
          block,
          isFirstLineOfBlock: true,
          blockIndex: bIdx,
        });
        currentY += lineH + fontSize * (block.blockAttributes.paragraphSpacing || 0.4);
        continue;
      }

      // Word wrap lines
      let lineWords: LaidOutWord[] = [];
      let currentLineWidth = 0;
      let isFirstLine = true;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.isSpace && lineWords.length === 0) {
          continue; // Trim leading space
        }

        if (currentLineWidth + word.width <= usableWidth || lineWords.length === 0) {
          lineWords.push(word);
          currentLineWidth += word.width;
        } else {
          // Wrap to new line
          const lineStats = this.computeLineStats(lineWords);
          lines.push({
            words: lineWords,
            width: currentLineWidth,
            height: lineStats.height,
            ascent: lineStats.ascent,
            y: currentY + lineStats.ascent,
            block,
            isFirstLineOfBlock: isFirstLine,
            blockIndex: bIdx,
          });
          currentY += lineStats.height;
          isFirstLine = false;

          lineWords = word.isSpace ? [] : [word];
          currentLineWidth = word.isSpace ? 0 : word.width;
        }
      }

      if (lineWords.length > 0) {
        const lineStats = this.computeLineStats(lineWords);
        lines.push({
          words: lineWords,
          width: currentLineWidth,
          height: lineStats.height,
          ascent: lineStats.ascent,
          y: currentY + lineStats.ascent,
          block,
          isFirstLineOfBlock: isFirstLine,
          blockIndex: bIdx,
        });
        currentY += lineStats.height;
      }

      // Add paragraph spacing
      const pSpacing = (block.blockAttributes.paragraphSpacing ?? 0.4) * block.blockAttributes.fontSize;
      currentY += pSpacing;

      if (isList) listItemCounter++;
    }

    this.laidOutLines = lines;
    this.totalHeight = Math.max(30, currentY);
    this.height(this.totalHeight);
  }

  private computeLineStats(words: LaidOutWord[]): { height: number; ascent: number } {
    let maxFontSize = 16;
    let maxLineHeightMultiplier = 1.2;

    for (const w of words) {
      const fs = w.run.attributes.fontSize ?? w.block.blockAttributes.fontSize ?? 16;
      const lh = w.block.blockAttributes.lineHeight ?? 1.2;
      if (fs > maxFontSize) maxFontSize = fs;
      if (lh > maxLineHeightMultiplier) maxLineHeightMultiplier = lh;
    }

    const height = maxFontSize * maxLineHeightMultiplier;
    const ascent = maxFontSize * 0.85;
    return { height, ascent };
  }

  private applyFontToCtx(ctx: CanvasRenderingContext2D, block: TextBlock, run: TextRun) {
    const fontSize = run.attributes.fontSize ?? block.blockAttributes.fontSize ?? 24;
    const fontFamily = run.attributes.fontFamily ?? block.blockAttributes.fontFamily ?? "Poppins";
    const bold = run.attributes.bold ? "bold" : "";
    const italic = run.attributes.italic ? "italic" : "";
    const weight = run.attributes.fontWeight ?? (run.attributes.bold ? 700 : block.blockAttributes.fontWeight ?? 400);

    ctx.font = `${italic} ${bold} ${weight} ${fontSize}px "${fontFamily}", -apple-system, sans-serif`.trim();
  }

  private renderCanvas(context: Konva.Context) {
    const ctx = context._context;
    ctx.save();

    // Glitch translation jitter
    if (this.animState.glitchOffset) {
      ctx.translate(this.animState.glitchOffset.x, this.animState.glitchOffset.y);
    }

    const boxWidth = this.width();
    const boxHeight = this.height();

    // Check if Curved Text mode is active
    if (this.doc.curve?.enabled) {
      this.renderCurved(ctx, boxWidth);
      ctx.restore();
      return;
    }

    // 1. Drop Shadow setup (with animated glow pulse bonus)
    if (this.doc.shadow || this.animState.glowPulse !== undefined) {
      const glow = this.animState.glowPulse ?? 0;
      const baseColor = this.doc.shadow?.color || "#FF6B35";
      const baseBlur = this.doc.shadow?.blur || 10;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = baseBlur + glow * 25;
      ctx.shadowOffsetX = this.doc.shadow?.offsetX || 0;
      ctx.shadowOffsetY = this.doc.shadow?.offsetY || 0;
    }

    // 2. Global Gradient Fill setup (or animated shimmer sweep)
    let gradientFill: CanvasGradient | null = null;
    if (this.doc.fill && this.doc.fill.type === "gradient") {
      const angleRad = ((this.doc.fill.angle - 90) * Math.PI) / 180;
      const halfW = boxWidth / 2;
      const halfH = boxHeight / 2;
      const x1 = halfW - Math.cos(angleRad) * halfW;
      const y1 = halfH - Math.sin(angleRad) * halfH;
      const x2 = halfW + Math.cos(angleRad) * halfW;
      const y2 = halfH + Math.sin(angleRad) * halfH;

      gradientFill = ctx.createLinearGradient(x1, y1, x2, y2);
      gradientFill.addColorStop(0, this.doc.fill.color1);
      gradientFill.addColorStop(1, this.doc.fill.color2);
    } else if (this.animState.shimmerProgress !== undefined) {
      const prog = this.animState.shimmerProgress;
      const sweepX = (prog * 1.8 - 0.4) * boxWidth;
      const shimmerGrad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
      const primaryColor = this.getFormattingState().color || "#F8FAFC";
      shimmerGrad.addColorStop(0, primaryColor);
      shimmerGrad.addColorStop(0.35, primaryColor);
      shimmerGrad.addColorStop(0.5, "#FFD166");
      shimmerGrad.addColorStop(0.65, primaryColor);
      shimmerGrad.addColorStop(1, primaryColor);
      gradientFill = shimmerGrad;
    }

    // 3. Render Each Line (with Typewriter gating)
    let listCounter = 1;
    let charCounter = 0;
    const maxChars = this.animState.typewriterChars ?? Infinity;
    let cursorInfo: { x: number; y: number; height: number } | null = null;

    for (let lIdx = 0; lIdx < this.laidOutLines.length; lIdx++) {
      const line = this.laidOutLines[lIdx];
      const block = line.block;
      const isList = block.type === "list-item";
      const listIndent = isList ? 28 : 0;
      const availableWidth = boxWidth - listIndent;

      // Calculate horizontal start position based on alignment
      let startX = listIndent;
      const align = block.blockAttributes.alignment || "left";
      if (align === "center") {
        startX = listIndent + Math.max(0, (availableWidth - line.width) / 2);
      } else if (align === "right") {
        startX = listIndent + Math.max(0, availableWidth - line.width);
      }

      // Draw list bullet / number on first line of block
      if (isList && line.isFirstLineOfBlock) {
        ctx.save();
        ctx.font = `600 ${block.blockAttributes.fontSize * 0.9}px "${block.blockAttributes.fontFamily}", sans-serif`;
        ctx.fillStyle = gradientFill || block.blockAttributes.color || "#F8FAFC";
        const marker = block.blockAttributes.listStyle === "decimal"
          ? `${listCounter++}.`
          : block.blockAttributes.listStyle === "★"
          ? "★"
          : "•";
        ctx.fillText(marker, 4, line.y);
        ctx.restore();
      }

      // Draw words in line
      let currentX = startX;
      for (const word of line.words) {
        if (charCounter >= maxChars) {
          break;
        }

        let wordText = word.text;
        if (charCounter + wordText.length > maxChars) {
          wordText = wordText.substring(0, maxChars - charCounter);
        }
        charCounter += word.text.length;

        this.applyFontToCtx(ctx, block, word.run);

        const color = gradientFill || word.run.attributes.color || block.blockAttributes.color || "#F8FAFC";
        const strokeColor = word.run.attributes.strokeColor || "#000000";
        const strokeWidth = word.run.attributes.strokeWidth || 0;

        // Draw Stroke / Outline behind fill
        if (strokeWidth > 0) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(wordText, currentX, line.y);
        }

        // Draw Text Fill
        ctx.fillStyle = color;
        ctx.fillText(wordText, currentX, line.y);

        const measuredW = ctx.measureText(wordText).width;

        if (this.animState.typewriterChars !== undefined && charCounter >= maxChars && !cursorInfo) {
          cursorInfo = { x: currentX + measuredW + 3, y: line.y, height: line.height };
        }

        // Underline
        if (word.run.attributes.underline) {
          const fontSize = word.run.attributes.fontSize || block.blockAttributes.fontSize || 24;
          ctx.strokeStyle = strokeWidth > 0 ? strokeColor : color;
          ctx.lineWidth = Math.max(1, fontSize * 0.07);
          ctx.beginPath();
          ctx.moveTo(currentX, line.y + 3);
          ctx.lineTo(currentX + measuredW, line.y + 3);
          ctx.stroke();
        }

        // Strikethrough
        if (word.run.attributes.strikethrough) {
          const fontSize = word.run.attributes.fontSize || block.blockAttributes.fontSize || 24;
          ctx.strokeStyle = strokeWidth > 0 ? strokeColor : color;
          ctx.lineWidth = Math.max(1, fontSize * 0.07);
          const strikeY = line.y - fontSize * 0.28;
          ctx.beginPath();
          ctx.moveTo(currentX, strikeY);
          ctx.lineTo(currentX + measuredW, strikeY);
          ctx.stroke();
        }

        currentX += word.width;
      }
    }

    // Draw typewriter blinking amber cursor
    if (cursorInfo && this.animState.typewriterChars !== undefined) {
      ctx.save();
      ctx.fillStyle = "#FF6B35";
      ctx.shadowColor = "#FF6B35";
      ctx.shadowBlur = 10;
      ctx.fillRect(cursorInfo.x, cursorInfo.y - cursorInfo.height * 0.75, 3.5, cursorInfo.height * 0.9);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderCurved(ctx: CanvasRenderingContext2D, boxWidth: number) {
    const text = this.getText().replace(/\n/g, " ").trim();
    if (!text) return;

    if (this.animState.glitchOffset) {
      ctx.translate(this.animState.glitchOffset.x, this.animState.glitchOffset.y);
    }

    const block = this.doc.blocks[0] ?? {
      id: "b-0",
      type: "paragraph",
      blockAttributes: {
        fontSize: 32,
        fontFamily: "Poppins",
        color: "#6D28D9",
        alignment: "center",
        lineHeight: 1.2,
        letterSpacing: 2,
        paragraphSpacing: 0,
      },
      content: [{ text, attributes: { bold: true } }],
    };

    const run = block.content[0] ?? { text, attributes: {} };
    this.applyFontToCtx(ctx, block, run);

    const amount = this.doc.curve?.amount ?? 140; // -360 to 360
    const arcDegrees = Math.min(359, Math.max(-359, amount));
    const arcRad = (arcDegrees * Math.PI) / 180;
    const isBottomArc = arcDegrees < 0;

    // Radius calculation
    const radius = Math.max(80, boxWidth / (2 * Math.sin(Math.abs(arcRad) / 2 || 0.1)));
    const centerX = boxWidth / 2;
    const centerY = isBottomArc ? radius - 40 : this.height() + radius - 40;

    // Shadow & glow
    if (this.doc.shadow || this.animState.glowPulse !== undefined) {
      const glow = this.animState.glowPulse ?? 0;
      const baseColor = this.doc.shadow?.color || "#FF6B35";
      const baseBlur = this.doc.shadow?.blur || 10;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = baseBlur + glow * 25;
      ctx.shadowOffsetX = this.doc.shadow?.offsetX || 0;
      ctx.shadowOffsetY = this.doc.shadow?.offsetY || 0;
    }

    const chars = Array.from(text);
    const charWidths = chars.map((ch) => ctx.measureText(ch).width + (block.blockAttributes.letterSpacing || 0));
    const totalTextWidth = charWidths.reduce((a, b) => a + b, 0);

    const charAngularWidths = charWidths.map((w) => (w / totalTextWidth) * arcRad);
    let currentAngle = isBottomArc
      ? Math.PI / 2 + arcRad / 2
      : -Math.PI / 2 - arcRad / 2;

    const color = run.attributes.color || block.blockAttributes.color || "#6D28D9";
    const strokeColor = run.attributes.strokeColor || "#000000";
    const strokeWidth = run.attributes.strokeWidth || 0;

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const angStep = charAngularWidths[i];
      const charAngle = currentAngle + angStep / 2;

      ctx.save();
      const x = centerX + radius * Math.cos(charAngle);
      const y = centerY + radius * Math.sin(charAngle);

      ctx.translate(x, y);
      ctx.rotate(charAngle + (isBottomArc ? -Math.PI / 2 : Math.PI / 2));

      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(ch, -charWidths[i] / 2, 0);
      }

      ctx.fillStyle = color;
      ctx.fillText(ch, -charWidths[i] / 2, 0);
      ctx.restore();

      currentAngle += isBottomArc ? -angStep : angStep;
    }
  }

  // --- Formatting API Methods ---

  public getFormattingState(): FormattingState {
    const firstBlock = this.doc.blocks[0];
    const firstRun = firstBlock?.content[0];

    return {
      fontFamily: firstRun?.attributes.fontFamily ?? firstBlock?.blockAttributes.fontFamily ?? "Poppins",
      fontSize: firstRun?.attributes.fontSize ?? firstBlock?.blockAttributes.fontSize ?? 36,
      fontWeight: firstRun?.attributes.fontWeight ?? (firstRun?.attributes.bold ? 700 : firstBlock?.blockAttributes.fontWeight ?? 400),
      bold: !!firstRun?.attributes.bold,
      italic: !!firstRun?.attributes.italic,
      underline: !!firstRun?.attributes.underline,
      strikethrough: !!firstRun?.attributes.strikethrough,
      color: firstRun?.attributes.color ?? firstBlock?.blockAttributes.color ?? "#1E293B",
      strokeWidth: firstRun?.attributes.strokeWidth ?? 0,
      strokeColor: firstRun?.attributes.strokeColor ?? "#000000",
      alignment: firstBlock?.blockAttributes.alignment ?? "left",
      lineHeight: firstBlock?.blockAttributes.lineHeight ?? 1.2,
      letterSpacing: firstBlock?.blockAttributes.letterSpacing ?? 0,
      paragraphSpacing: firstBlock?.blockAttributes.paragraphSpacing ?? 0.4,
      isList: firstBlock?.type === "list-item",
      listStyle: firstBlock?.blockAttributes.listStyle,
      canUndo: false,
      canRedo: false,
    };
  }

  public toggleBold() {
    const current = this.getFormattingState().bold;
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.bold = !current;
        r.attributes.fontWeight = !current ? 700 : 400;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public toggleItalic() {
    const current = this.getFormattingState().italic;
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.italic = !current;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public toggleUnderline() {
    const current = this.getFormattingState().underline;
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.underline = !current;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public toggleStrikethrough() {
    const current = this.getFormattingState().strikethrough;
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.strikethrough = !current;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setFontFamily(fontFamily: string) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.fontFamily = fontFamily;
      for (const r of b.content) {
        r.attributes.fontFamily = fontFamily;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setFontSize(fontSize: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.fontSize = fontSize;
      for (const r of b.content) {
        r.attributes.fontSize = fontSize;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public scaleFontSize(factor: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.fontSize = Math.max(8, Math.round(b.blockAttributes.fontSize * factor));
      for (const r of b.content) {
        if (r.attributes.fontSize) {
          r.attributes.fontSize = Math.max(8, Math.round(r.attributes.fontSize * factor));
        }
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setFontWeight(weight: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.fontWeight = weight;
      for (const r of b.content) {
        r.attributes.fontWeight = weight;
        r.attributes.bold = weight >= 700;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setColor(color: string) {
    this.doc.fill = undefined; // solid color removes gradient
    for (const b of this.doc.blocks) {
      b.blockAttributes.color = color;
      for (const r of b.content) {
        r.attributes.color = color;
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setStrokeWidth(width: number) {
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.strokeWidth = width;
      }
    }
    this.getLayer()?.batchDraw();
  }

  public setStrokeColor(color: string) {
    for (const b of this.doc.blocks) {
      for (const r of b.content) {
        r.attributes.strokeColor = color;
      }
    }
    this.getLayer()?.batchDraw();
  }

  public setShadow(shadow: TextShadow | null) {
    this.doc.shadow = shadow ?? undefined;
    this.getLayer()?.batchDraw();
  }

  public setFill(fill: GradientFill | null) {
    this.doc.fill = fill ?? undefined;
    this.getLayer()?.batchDraw();
  }

  public setAlignment(alignment: "left" | "center" | "right" | "justify") {
    for (const b of this.doc.blocks) {
      b.blockAttributes.alignment = alignment;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setLineHeight(lineHeight: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.lineHeight = lineHeight;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setLetterSpacing(letterSpacing: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.letterSpacing = letterSpacing;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setParagraphSpacing(paragraphSpacing: number) {
    for (const b of this.doc.blocks) {
      b.blockAttributes.paragraphSpacing = paragraphSpacing;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public toggleBulletList(bulletStyle: string = "disc") {
    const isList = this.doc.blocks.some((b) => b.type === "list-item");
    for (const b of this.doc.blocks) {
      b.type = isList ? "paragraph" : "list-item";
      b.blockAttributes.listType = isList ? undefined : (bulletStyle === "decimal" ? "number" : "bullet");
      b.blockAttributes.listStyle = isList ? undefined : (bulletStyle as any);
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setBulletStyle(style: string) {
    for (const b of this.doc.blocks) {
      if (b.type === "list-item") {
        b.blockAttributes.listStyle = style as any;
        b.blockAttributes.listType = style === "decimal" ? "number" : "bullet";
      }
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public toggleCurve() {
    if (!this.doc.curve) {
      this.doc.curve = { enabled: true, amount: 140 };
    } else {
      this.doc.curve.enabled = !this.doc.curve.enabled;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public setCurveAmount(amount: number) {
    if (!this.doc.curve) {
      this.doc.curve = { enabled: true, amount };
    } else {
      this.doc.curve.enabled = true;
      this.doc.curve.amount = amount;
    }
    this.updateLayout();
    this.getLayer()?.batchDraw();
  }

  public getCurveEnabled(): boolean {
    return !!this.doc.curve?.enabled;
  }

  public getCurveAmount(): number {
    return this.doc.curve?.amount ?? 140;
  }

  public copyfitDocument(containerHeight: number, minScale = 0.25): number {
    let currentScale = 1.0;
    this.updateLayout();

    if (this.height() <= containerHeight) {
      return 1.0;
    }

    for (let iter = 0; iter < 25; iter++) {
      if (this.height() <= containerHeight || currentScale <= minScale) {
        break;
      }
      this.scaleFontSize(0.92);
      currentScale *= 0.92;
      this.updateLayout();
    }

    this.getLayer()?.batchDraw();
    return currentScale;
  }
}
