import Konva from "konva";
import { RichTextNode } from "./rich-text-engine";
import { ForgeImageNode } from "./forge-image-node";
import { createForgeImageFromDataUrl } from "./media-loader";
import { RichTextDocument, DocumentCurve, FormattingState } from "./types";
import { TemplateDefinition } from "./presets";
import { AtmosphericFXManager } from "./atmospheric-fx";

interface HistoryEntry {
  boxes: Array<{
    x: number;
    y: number;
    width: number;
    rotation: number;
    document: RichTextDocument;
  }>;
  images?: Array<any>;
  background: string;
}

export class CanvasManager {
  public stage: Konva.Stage;
  public mainLayer: Konva.Layer;
  public backgroundLayer: Konva.Layer;
  public selectionTransformer: Konva.Transformer;
  public atmosphericFX: AtmosphericFXManager;

  private container: HTMLDivElement;
  public bgRect: Konva.Rect;
  private canvasWidth = 960;
  private canvasHeight = 540;
  private currentScale = 1;

  // History stack
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private isHistoryLocked = false;

  // Inline editing overlay
  private editingOverlay: HTMLTextAreaElement | null = null;
  private activeEditingNode: RichTextNode | null = null;

  public onSelectionChangeCallback?: (node: Konva.Node | null) => void;
  public onFormattingChangeCallback?: (state: FormattingState | null, node: RichTextNode | null) => void;
  public onImageSelectionCallback?: (node: ForgeImageNode | null) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Stage
    this.stage = new Konva.Stage({
      container,
      width: this.canvasWidth,
      height: this.canvasHeight,
    });

    // 2. Background Layer
    this.backgroundLayer = new Konva.Layer();
    this.stage.add(this.backgroundLayer);

    this.bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: "#0B0E17",
      shadowColor: "rgba(0, 0, 0, 0.6)",
      shadowBlur: 32,
      shadowOffset: { x: 0, y: 12 },
      cornerRadius: 6,
    });
    this.backgroundLayer.add(this.bgRect);

    // 3. Main Layer
    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);

    // 4. Selection Transformer
    this.selectionTransformer = new Konva.Transformer({
      enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
      ],
      rotateEnabled: true,
      borderStroke: "#FF6B35",
      borderStrokeWidth: 1.5,
      anchorStroke: "#FFA62B",
      anchorFill: "#FF6B35",
      anchorSize: 9,
      anchorCornerRadius: 2,
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 40 || newBox.height < 20) {
          return oldBox;
        }
        return newBox;
      },
    });
    this.mainLayer.add(this.selectionTransformer);

    // 5. Atmospheric FX Engine (From /effects/)
    this.atmosphericFX = new AtmosphericFXManager();
    this.atmosphericFX.initNodes(this.mainLayer, this.canvasWidth, this.canvasHeight);

    // Middle handles change width only
    this.selectionTransformer.on("transform", () => {
      const activeAnchor = this.selectionTransformer.getActiveAnchor();
      const node = this.getSelected();
      if (!node) return;

      if (activeAnchor === "middle-left" || activeAnchor === "middle-right") {
        const scaleX = node.scaleX();
        node.width(Math.max(40, node.width() * scaleX));
        node.scaleX(1);
        node.scaleY(1);
        node.updateLayout();
      }
    });

    this.selectionTransformer.on("transformend", () => {
      const node = this.getSelected();
      if (node) {
        node.updateLayout();
        this.saveHistory();
        this.emitFormattingChange();
      }
    });

    // 5. Click & Selection Handling
    this.stage.on("mousedown touchstart", (e) => {
      if (this.activeEditingNode) {
        this.stopInlineEditing();
      }

      if (e.target === this.stage || e.target === this.bgRect) {
        this.selectNode(null);
        return;
      }

      let current: Konva.Node | null = e.target;
      while (current && current !== this.stage && current !== this.mainLayer) {
        if (current instanceof RichTextNode) {
          this.selectNode(current);
          return;
        }
        if (current instanceof ForgeImageNode || current.name() === "forge-image") {
          this.selectNode(current as ForgeImageNode);
          return;
        }
        current = current.parent;
      }
    });

    // Double-click to start inline editing
    this.stage.on("dblclick dbltap", (e) => {
      let targetNode: RichTextNode | null = null;
      let current: Konva.Node | null = e.target;
      while (current && current !== this.stage && current !== this.mainLayer) {
        if (current instanceof RichTextNode) {
          targetNode = current;
          break;
        }
        current = current.parent;
      }
      const nodeToEdit = targetNode || this.getSelected();
      if (nodeToEdit) {
        this.selectNode(nodeToEdit);
        this.startInlineEditing(nodeToEdit);
      }
    });

    // Record drag end
    this.mainLayer.on("dragend", () => {
      this.saveHistory();
    });

    this.backgroundLayer.draw();
    this.mainLayer.draw();
  }

  public getSelected(): RichTextNode | null {
    const nodes = this.selectionTransformer.nodes();
    if (nodes.length > 0 && nodes[0] instanceof RichTextNode) {
      return nodes[0] as RichTextNode;
    }
    return null;
  }

  public getSelectedNode(): Konva.Node | null {
    const nodes = this.selectionTransformer.nodes();
    return nodes.length > 0 ? nodes[0] : null;
  }

  public getSelectedImage(): ForgeImageNode | null {
    const nodes = this.selectionTransformer.nodes();
    if (nodes.length > 0 && nodes[0] instanceof ForgeImageNode) {
      return nodes[0] as ForgeImageNode;
    }
    return null;
  }

  public selectNode(node: Konva.Node | null) {
    if (node) {
      this.selectionTransformer.nodes([node]);
      this.selectionTransformer.moveToTop();
      this.mainLayer.draw();
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(node);
      }
      if (node instanceof RichTextNode) {
        this.emitFormattingChange();
      } else {
        if (this.onFormattingChangeCallback) {
          this.onFormattingChangeCallback(null, null);
        }
      }
      if (this.onImageSelectionCallback) {
        this.onImageSelectionCallback(node instanceof ForgeImageNode ? node : null);
      }
    } else {
      this.selectionTransformer.nodes([]);
      this.mainLayer.draw();
      if (this.onSelectionChangeCallback) {
        this.onSelectionChangeCallback(null);
      }
      if (this.onFormattingChangeCallback) {
        this.onFormattingChangeCallback(null, null);
      }
      if (this.onImageSelectionCallback) {
        this.onImageSelectionCallback(null);
      }
    }
  }

  public emitFormattingChange() {
    const node = this.getSelected();
    if (node && this.onFormattingChangeCallback) {
      const state = node.getFormattingState();
      state.canUndo = this.undoStack.length > 0;
      state.canRedo = this.redoStack.length > 0;
      this.onFormattingChangeCallback(state, node);
    }
  }

  public addText(text: string, fontSize = 36, options?: Partial<{
    fontFamily: string;
    color: string;
    x: number;
    y: number;
    width: number;
    bold: boolean;
    italic: boolean;
    curveAmount: number;
  }>): RichTextNode {
    const defaultColor = options?.color ?? "#F8FAFC";
    const doc: RichTextDocument = {
      baseFontSize: fontSize,
      curve: options?.curveAmount !== undefined ? { enabled: true, amount: options.curveAmount } : undefined,
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: "paragraph",
          blockAttributes: {
            fontSize,
            fontFamily: options?.fontFamily ?? "Poppins",
            color: defaultColor,
            alignment: "center",
            lineHeight: 1.2,
            letterSpacing: 0,
            paragraphSpacing: 0.4,
          },
          content: [
            {
              text,
              attributes: {
                bold: options?.bold,
                italic: options?.italic,
                fontSize,
                fontFamily: options?.fontFamily ?? "Poppins",
                color: defaultColor,
              },
            },
          ],
        },
      ],
    };

    const targetWidth = Math.min(options?.width ?? Math.min(540, this.canvasWidth - 40), this.canvasWidth - 40);
    const defaultX = options?.x ?? Math.max(10, Math.round((this.canvasWidth - targetWidth) / 2));
    const defaultY = options?.y ?? Math.max(20, Math.round((this.canvasHeight - fontSize * 1.6) / 2));

    const node = new RichTextNode({
      x: defaultX,
      y: defaultY,
      width: targetWidth,
      document: doc,
    });

    this.mainLayer.add(node);
    this.atmosphericFX.refreshZIndex(this.selectionTransformer);
    this.selectNode(node);
    this.saveHistory();
    return node;
  }

  public addBoxFromDocument(
    document: RichTextDocument,
    config: {
      x: number;
      y: number;
      width: number;
      documentCurve?: DocumentCurve;
    }
  ): RichTextNode {
    const node = new RichTextNode({
      x: config.x,
      y: config.y,
      width: config.width,
      document: {
        ...document,
        curve: config.documentCurve ?? document.curve,
      },
    });

    this.mainLayer.add(node);
    node.zIndex(this.mainLayer.children.length - 2);
    this.mainLayer.draw();
    return node;
  }

  public loadTemplate(template: TemplateDefinition) {
    this.clearStage();
    this.setCanvasBackground(template.canvasBackground);

    let firstNode: RichTextNode | null = null;
    for (const item of template.items) {
      const node = this.addBoxFromDocument(item.document, {
        x: item.x,
        y: item.y,
        width: item.width,
        documentCurve: item.documentCurve,
      });
      if (!firstNode) firstNode = node;
    }

    if (firstNode) {
      this.selectNode(firstNode);
    }
    this.saveHistory();
  }

  public clearStage() {
    this.stopInlineEditing();
    this.selectionTransformer.nodes([]);
    const children = [...this.mainLayer.children];
    for (const child of children) {
      if (
        child !== this.selectionTransformer &&
        child !== this.atmosphericFX.getBgShape() &&
        child !== this.atmosphericFX.getFgShape()
      ) {
        child.destroy();
      }
    }
    this.mainLayer.draw();
    this.saveHistory();
    this.selectNode(null);
  }

  public deleteSelected() {
    const node = this.getSelectedNode();
    if (node) {
      this.stopInlineEditing();
      this.selectionTransformer.nodes([]);
      node.destroy();
      this.mainLayer.draw();
      this.saveHistory();
      this.selectNode(null);
    }
  }

  public duplicateSelected(): Konva.Node | null {
    const node = this.getSelectedNode();
    if (!node) return null;

    if (node instanceof RichTextNode) {
      const doc = node.getDocument();
      const clone = new RichTextNode({
        x: node.x() + 30,
        y: node.y() + 30,
        width: node.width(),
        document: doc,
      });
      clone.rotation(node.rotation());

      this.mainLayer.add(clone);
      clone.zIndex(this.mainLayer.children.length - 2);
      this.selectNode(clone);
      this.saveHistory();
      return clone;
    }
    return null;
  }

  public bringForward() {
    const node = this.getSelectedNode();
    if (node) {
      node.moveUp();
      this.selectionTransformer.moveToTop();
      this.mainLayer.draw();
      this.saveHistory();
    }
  }

  public sendBackward() {
    const node = this.getSelectedNode();
    if (node) {
      node.moveDown();
      this.selectionTransformer.moveToTop();
      this.mainLayer.draw();
      this.saveHistory();
    }
  }

  public addImageNode(node: ForgeImageNode): ForgeImageNode {
    if (node.x() === 100 && node.y() === 100) {
      const w = node.width() * node.scaleX();
      const h = node.height() * node.scaleY();
      node.x(Math.max(20, Math.round((this.canvasWidth - w) / 2)));
      node.y(Math.max(20, Math.round((this.canvasHeight - h) / 2)));
    }
    this.mainLayer.add(node);
    this.atmosphericFX.refreshZIndex(this.selectionTransformer);
    this.selectNode(node);
    this.mainLayer.batchDraw();
    this.saveHistory();
    return node;
  }

  public getImages(): ForgeImageNode[] {
    return this.mainLayer.children.filter((c) => c instanceof ForgeImageNode) as ForgeImageNode[];
  }

  public setCanvasBackground(color: string) {
    this.bgRect.fill(color);
    this.backgroundLayer.draw();
  }

  public getCanvasBackground(): string {
    return this.bgRect.fill() as string;
  }

  public setAspectRatio(width: number, height: number) {
    const oldWidth = this.canvasWidth;
    const oldHeight = this.canvasHeight;

    this.canvasWidth = width;
    this.canvasHeight = height;

    this.stage.width(width);
    this.stage.height(height);

    this.bgRect.width(width);
    this.bgRect.height(height);

    // Auto-center all text nodes on the new aspect ratio
    this.centerAllNodesOnCanvas(oldWidth, oldHeight);

    this.backgroundLayer.batchDraw();
    this.mainLayer.batchDraw();
    if (this.activeEditingNode) {
      this.repositionEditingOverlay();
    }
  }

  public centerSelectedNode() {
    const node = this.getSelectedNode();
    if (!node) return;
    if (node instanceof RichTextNode) {
      this.centerNode(node);
    } else if (node instanceof ForgeImageNode) {
      const w = node.width() * node.scaleX();
      const h = node.height() * node.scaleY();
      node.x(Math.max(10, Math.round((this.canvasWidth - w) / 2)));
      node.y(Math.max(10, Math.round((this.canvasHeight - h) / 2)));
    }
    this.saveHistory();
    this.mainLayer.batchDraw();
  }

  public centerNode(node: RichTextNode) {
    const maxW = Math.max(100, this.canvasWidth - 40);
    if (node.width() > maxW) {
      node.width(maxW);
    }
    const x = Math.max(10, Math.round((this.canvasWidth - node.width()) / 2));
    const y = Math.max(10, Math.round((this.canvasHeight - node.height()) / 2));
    node.x(x);
    node.y(y);
    if (this.activeEditingNode === node) {
      this.repositionEditingOverlay();
    }
  }

  public centerAllNodesOnCanvas(oldWidth?: number, oldHeight?: number) {
    const boxes = this.getBoxes();
    if (boxes.length === 0) return;

    // 1. Constrain widths if wider than new aspect canvas and center each horizontally
    for (const box of boxes) {
      const maxW = Math.max(100, this.canvasWidth - 40);
      if (box.width() > maxW) {
        box.width(maxW);
      }
      box.x(Math.max(10, Math.round((this.canvasWidth - box.width()) / 2)));
    }

    // 2. Center stack vertically
    let minY = Infinity;
    let maxY = -Infinity;
    for (const box of boxes) {
      const top = box.y();
      const bottom = top + box.height();
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
    }

    const stackHeight = maxY - minY;
    // Calculate target top position so the entire group is vertically centered
    const targetTop = Math.max(15, Math.round((this.canvasHeight - stackHeight) / 2));
    const deltaY = targetTop - minY;

    for (const box of boxes) {
      box.y(Math.max(10, Math.round(box.y() + deltaY)));
    }

    this.saveHistory();
  }

  public getCanvasWidth(): number {
    return this.canvasWidth;
  }

  public getCanvasHeight(): number {
    return this.canvasHeight;
  }

  public setZoom(zoom: number) {
    this.currentScale = Math.max(0.2, Math.min(3, zoom));
    this.stage.scale({ x: this.currentScale, y: this.currentScale });
    this.stage.draw();
    if (this.activeEditingNode) {
      this.repositionEditingOverlay();
    }
  }

  public getZoom(): number {
    return this.currentScale;
  }

  public zoomIn() {
    this.setZoom(this.currentScale + 0.15);
  }

  public zoomOut() {
    this.setZoom(this.currentScale - 0.15);
  }

  public resetZoom() {
    this.setZoom(1);
    this.stage.position({ x: 0, y: 0 });
    this.stage.draw();
  }

  // --- Inline Text Editing Overlay ---
  public startInlineEditing(node: RichTextNode) {
    if (this.editingOverlay) {
      this.stopInlineEditing();
    }

    this.activeEditingNode = node;

    // Create textarea
    const textarea = document.createElement("textarea");
    textarea.value = node.getText();
    textarea.className = "in-canvas-text-editor";

    // Style textarea to match text node
    const state = node.getFormattingState();
    textarea.style.position = "absolute";
    textarea.style.zIndex = "100";
    textarea.style.fontFamily = `"${state.fontFamily}", sans-serif`;
    textarea.style.fontSize = `${state.fontSize * this.currentScale}px`;
    textarea.style.fontWeight = String(state.fontWeight);
    textarea.style.color = state.color;
    textarea.style.textAlign = state.alignment;
    textarea.style.lineHeight = String(state.lineHeight);
    textarea.style.border = "2px solid #FF6B35";
    textarea.style.borderRadius = "8px";
    textarea.style.padding = "6px 10px";
    textarea.style.outline = "none";
    textarea.style.background = "rgba(14, 19, 31, 0.96)";
    textarea.style.color = state.color || "#F8FAFC";
    textarea.style.caretColor = "#FF6B35";
    textarea.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 53, 0.35)";
    textarea.style.resize = "none";

    this.container.appendChild(textarea);
    this.container.classList.add("editing-active");
    this.editingOverlay = textarea;
    this.repositionEditingOverlay();

    textarea.focus();
    textarea.select();

    // Live sync
    textarea.addEventListener("input", () => {
      node.setText(textarea.value);
      this.repositionEditingOverlay();
      this.emitFormattingChange();
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.stopInlineEditing();
      }
    });

    // Close and save on blur
    textarea.addEventListener("blur", () => {
      setTimeout(() => {
        if (this.editingOverlay === textarea) {
          this.stopInlineEditing();
        }
      }, 120);
    });
  }

  public repositionEditingOverlay() {
    if (!this.editingOverlay || !this.activeEditingNode) return;
    const node = this.activeEditingNode;
    const pos = node.getAbsolutePosition();
    const width = node.width() * this.currentScale;
    const height = Math.max(60, node.height() * this.currentScale);

    this.editingOverlay.style.left = `${pos.x}px`;
    this.editingOverlay.style.top = `${pos.y}px`;
    this.editingOverlay.style.width = `${width}px`;
    this.editingOverlay.style.height = `${height + 20}px`;
  }

  public stopInlineEditing() {
    if (!this.editingOverlay || !this.activeEditingNode) return;
    this.container.classList.remove("editing-active");
    this.activeEditingNode.setText(this.editingOverlay.value);
    this.container.removeChild(this.editingOverlay);
    this.editingOverlay = null;
    this.activeEditingNode = null;
    this.saveHistory();
    this.emitFormattingChange();
  }

  public isEditing(): boolean {
    return this.editingOverlay !== null;
  }

  // --- Copyfit Demo ---
  public runCopyfitDemo(containerHeight = 100) {
    const node = this.getSelected();
    if (!node) return null;
    const scale = node.copyfitDocument(containerHeight);
    this.saveHistory();
    this.emitFormattingChange();
    return scale;
  }

  // --- History (Undo / Redo) ---
  public saveHistory() {
    if (this.isHistoryLocked) return;
    const snapshot = this.createSnapshot();
    this.undoStack.push(snapshot);
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
    this.emitFormattingChange();
  }

  public undo() {
    if (this.undoStack.length <= 1) return;
    this.isHistoryLocked = true;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    const prev = this.undoStack[this.undoStack.length - 1];
    this.restoreSnapshot(prev);
    this.isHistoryLocked = false;
    this.emitFormattingChange();
  }

  public redo() {
    if (this.redoStack.length === 0) return;
    this.isHistoryLocked = true;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);

    this.restoreSnapshot(next);
    this.isHistoryLocked = false;
    this.emitFormattingChange();
  }

  private createSnapshot(): HistoryEntry {
    const boxes = this.getBoxes().map((box) => ({
      x: box.x(),
      y: box.y(),
      width: box.width(),
      rotation: box.rotation(),
      document: box.getDocument(),
    }));
    return {
      boxes,
      background: this.getCanvasBackground(),
    };
  }

  private restoreSnapshot(snapshot: HistoryEntry) {
    this.selectionTransformer.nodes([]);
    const children = [...this.mainLayer.children];
    for (const child of children) {
      if (child !== this.selectionTransformer) child.destroy();
    }

    this.setCanvasBackground(snapshot.background);

    let firstNode: RichTextNode | null = null;
    for (const b of snapshot.boxes) {
      const node = new RichTextNode({
        x: b.x,
        y: b.y,
        width: b.width,
        document: b.document,
      });
      node.rotation(b.rotation);
      this.mainLayer.add(node);
      node.zIndex(this.mainLayer.children.length - 2);
      if (!firstNode) firstNode = node;
    }

    if (firstNode) {
      this.selectNode(firstNode);
    }
    this.mainLayer.draw();
  }

  public getBoxes(): RichTextNode[] {
    return this.mainLayer.children.filter((c) => c instanceof RichTextNode) as RichTextNode[];
  }

  // --- Export ---
  public exportPNG(): string {
    this.selectionTransformer.nodes([]);
    this.mainLayer.draw();

    return this.stage.toDataURL({
      pixelRatio: 2,
      mimeType: "image/png",
    });
  }

  public exportJSON(): string {
    const data = {
      app: "EsperanzaKonva Forge",
      author: "FlaskArchitect",
      version: 1,
      canvas: {
        width: this.canvasWidth,
        height: this.canvasHeight,
        background: this.getCanvasBackground(),
      },
      atmosphericFX: this.atmosphericFX.exportState(),
      boxes: this.getBoxes().map((box) => ({
        x: box.x(),
        y: box.y(),
        width: box.width(),
        rotation: box.rotation(),
        document: box.getDocument(),
      })),
      images: this.getImages().map((img) => img.toJSONData()),
    };
    return JSON.stringify(data, null, 2);
  }

  public importJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.boxes || !Array.isArray(data.boxes)) return false;

      this.clearStage();
      if (data.canvas?.width && data.canvas?.height) {
        this.canvasWidth = data.canvas.width;
        this.canvasHeight = data.canvas.height;
        this.stage.width(data.canvas.width);
        this.stage.height(data.canvas.height);
        this.bgRect.width(data.canvas.width);
        this.bgRect.height(data.canvas.height);
        this.atmosphericFX.updateDimensions(data.canvas.width, data.canvas.height);
      }
      if (data.canvas?.background) {
        this.setCanvasBackground(data.canvas.background);
      }
      if (data.atmosphericFX) {
        this.atmosphericFX.importState(data.atmosphericFX);
      }

      let firstNode: RichTextNode | null = null;
      for (const item of data.boxes) {
        const node = this.addBoxFromDocument(item.document, {
          x: item.x,
          y: item.y,
          width: item.width,
          documentCurve: item.document?.curve,
        });
        if (item.rotation) node.rotation(item.rotation);
        if (!firstNode) firstNode = node;
      }

      if (data.images && Array.isArray(data.images)) {
        for (const imgData of data.images) {
          createForgeImageFromDataUrl(imgData.src, {
            x: imgData.x,
            y: imgData.y,
            width: imgData.width,
            height: imgData.height,
            scaleX: imgData.scaleX,
            scaleY: imgData.scaleY,
            rotation: imgData.rotation,
            opacity: imgData.opacity,
            shadowColor: imgData.shadowColor,
            shadowBlur: imgData.shadowBlur,
          }).then((imgNode) => {
            this.mainLayer.add(imgNode);
            imgNode.zIndex(this.mainLayer.children.length - 2);
            this.mainLayer.batchDraw();
          });
        }
      }

      if (firstNode) {
        this.selectNode(firstNode);
      }
      this.backgroundLayer.batchDraw();
      this.mainLayer.batchDraw();
      this.saveHistory();
      return true;
    } catch {
      return false;
    }
  }

  public addDocumentBox(doc: RichTextDocument, width = 640): RichTextNode {
    const x = Math.max(20, Math.round((this.canvasWidth - width) / 2));
    const y = Math.max(40, Math.round((this.canvasHeight - 160) / 2));
    const node = this.addBoxFromDocument(doc, {
      x,
      y,
      width,
      documentCurve: doc.curve,
    });
    this.selectNode(node);
    this.saveHistory();
    return node;
  }
}
