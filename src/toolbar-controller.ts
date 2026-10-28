import { CanvasManager } from "./canvas-manager";
import { RichTextNode } from "./rich-text-engine";
import { FormattingState } from "./types";
import { LOOK_PRESETS, LookPreset } from "./presets";

export class ToolbarController {
  private canvasManager: CanvasManager;
  private currentState: FormattingState | null = null;
  private currentNode: RichTextNode | null = null;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
    this.setupListeners();
    this.setupFormattingWatcher();
    this.setupShortcuts();
  }

  private byId<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el as T;
  }

  private setupFormattingWatcher() {
    this.canvasManager.onFormattingChangeCallback = (state, node) => {
      this.currentState = state;
      this.currentNode = node;
      this.updateUI(state, node);
    };
  }

  public updateUI(state: FormattingState | null, node: RichTextNode | null) {
    const selectedNode = this.canvasManager.getSelectedNode();
    const hasAnySelection = selectedNode !== null;
    const hasTextSelection = state !== null && node !== null;

    // Controls that operate on ANY selected object on the canvas (Text OR Stickers/Images/Videos):
    // Delete Box/Element, Duplicate, Bring Forward, Send Backward
    const objectControls = document.querySelectorAll<HTMLElement>(
      "#btn-delete, #btn-duplicate, #btn-bring-forward, #btn-send-backward"
    );
    objectControls.forEach((el) => {
      if (hasAnySelection) {
        el.removeAttribute("disabled");
        el.classList.remove("opacity-40", "pointer-events-none");
      } else {
        el.setAttribute("disabled", "true");
        el.classList.add("opacity-40", "pointer-events-none");
      }
    });

    // Controls that operate ONLY on Rich Text (fonts, weights, formatting, alignment, lists):
    const textControls = document.querySelectorAll<HTMLElement>(
      "[data-requires-selection]:not(#btn-delete):not(#btn-duplicate):not(#btn-bring-forward):not(#btn-send-backward)"
    );
    textControls.forEach((el) => {
      if (hasTextSelection) {
        el.removeAttribute("disabled");
        el.classList.remove("opacity-40", "pointer-events-none");
      } else {
        el.setAttribute("disabled", "true");
        el.classList.add("opacity-40", "pointer-events-none");
      }
    });

    const fontSelect = this.byId<HTMLSelectElement>("toolbar-font");
    const fontSizeInput = this.byId<HTMLInputElement>("toolbar-size");
    const fontWeightSelect = this.byId<HTMLSelectElement>("toolbar-weight");
    const boldBtn = this.byId<HTMLButtonElement>("btn-bold");
    const italicBtn = this.byId<HTMLButtonElement>("btn-italic");
    const underlineBtn = this.byId<HTMLButtonElement>("btn-underline");
    const strikeBtn = this.byId<HTMLButtonElement>("btn-strike");
    const colorPicker = this.byId<HTMLInputElement>("toolbar-color");
    const colorSwatch = this.byId<HTMLDivElement>("toolbar-color-swatch");
    const bulletsBtn = this.byId<HTMLButtonElement>("btn-bullets");
    const numbersBtn = this.byId<HTMLButtonElement>("btn-numbers");
    const undoBtn = this.byId<HTMLButtonElement>("btn-undo");
    const redoBtn = this.byId<HTMLButtonElement>("btn-redo");
    const selectionInfo = this.byId<HTMLSpanElement>("selection-info");

    undoBtn.disabled = !this.canvasManager.canUndo();
    redoBtn.disabled = !this.canvasManager.canRedo();

    const alignButtons = document.querySelectorAll<HTMLButtonElement>("[data-align]");
    alignButtons.forEach((btn) => {
      btn.classList.toggle("active", hasTextSelection && btn.dataset.align === state?.alignment);
    });

    if (hasAnySelection && !hasTextSelection) {
      selectionInfo.textContent = "Graphic Selected • Press Delete to remove";
    }

    // Inspector
    const strokeWidth = this.byId<HTMLInputElement>("stroke-width");
    const strokeWidthVal = this.byId<HTMLSpanElement>("stroke-width-val");
    const strokeColor = this.byId<HTMLInputElement>("stroke-color");
    const strokeColorSwatch = this.byId<HTMLDivElement>("stroke-color-swatch");

    const shadowToggle = this.byId<HTMLInputElement>("shadow-toggle");
    const shadowColor = this.byId<HTMLInputElement>("shadow-color");
    const shadowBlur = this.byId<HTMLInputElement>("shadow-blur");
    const shadowBlurVal = this.byId<HTMLSpanElement>("shadow-blur-val");
    const shadowOffsetX = this.byId<HTMLInputElement>("shadow-offset-x");
    const shadowOffsetXVal = this.byId<HTMLSpanElement>("shadow-offset-x-val");
    const shadowOffsetY = this.byId<HTMLInputElement>("shadow-offset-y");
    const shadowOffsetYVal = this.byId<HTMLSpanElement>("shadow-offset-y-val");

    const curveToggle = this.byId<HTMLInputElement>("curve-toggle");
    const curveAmount = this.byId<HTMLInputElement>("curve-amount");
    const curveAmountVal = this.byId<HTMLSpanElement>("curve-amount-val");

    const lineHeight = this.byId<HTMLInputElement>("line-height");
    const lineHeightVal = this.byId<HTMLSpanElement>("line-height-val");
    const letterSpacing = this.byId<HTMLInputElement>("letter-spacing");
    const letterSpacingVal = this.byId<HTMLSpanElement>("letter-spacing-val");
    const paragraphSpacing = this.byId<HTMLInputElement>("paragraph-spacing");
    const paragraphSpacingVal = this.byId<HTMLSpanElement>("paragraph-spacing-val");

    const gradientToggle = this.byId<HTMLInputElement>("gradient-toggle");
    const gradColor1 = this.byId<HTMLInputElement>("grad-color-1");
    const gradColor2 = this.byId<HTMLInputElement>("grad-color-2");
    const gradAngle = this.byId<HTMLInputElement>("grad-angle");
    const gradAngleVal = this.byId<HTMLSpanElement>("grad-angle-val");

    if (!state || !node) {
      selectionInfo.textContent = "Ready • Click any element to edit";
      boldBtn.classList.remove("active");
      italicBtn.classList.remove("active");
      underlineBtn.classList.remove("active");
      strikeBtn.classList.remove("active");
      bulletsBtn.classList.remove("active");
      numbersBtn.classList.remove("active");
      return;
    }

    fontSelect.value = state.fontFamily;
    fontSizeInput.value = String(Math.round(state.fontSize));
    fontWeightSelect.value = String(state.fontWeight);

    boldBtn.classList.toggle("active", !!state.bold);
    italicBtn.classList.toggle("active", !!state.italic);
    underlineBtn.classList.toggle("active", !!state.underline);
    strikeBtn.classList.toggle("active", !!state.strikethrough);

    bulletsBtn.classList.toggle("active", !!state.isList && state.listStyle !== "decimal");
    numbersBtn.classList.toggle("active", !!state.isList && state.listStyle === "decimal");

    colorPicker.value = this.normalizeHexColor(state.color);
    colorSwatch.style.backgroundColor = state.color;

    // Stroke
    strokeWidth.value = String(state.strokeWidth);
    strokeWidthVal.textContent = `${state.strokeWidth}px`;
    strokeColor.value = this.normalizeHexColor(state.strokeColor);
    strokeColorSwatch.style.backgroundColor = state.strokeColor;

    // Spacing
    lineHeight.value = String(state.lineHeight);
    lineHeightVal.textContent = `${state.lineHeight.toFixed(1)}x`;
    letterSpacing.value = String(state.letterSpacing);
    letterSpacingVal.textContent = `${state.letterSpacing}px`;
    paragraphSpacing.value = String(state.paragraphSpacing);
    paragraphSpacingVal.textContent = `${state.paragraphSpacing.toFixed(1)}x`;

    // Document effects
    const doc = node.getDocument();
    if (doc.shadow) {
      shadowToggle.checked = true;
      shadowColor.value = this.normalizeHexColor(doc.shadow.color);
      shadowBlur.value = String(doc.shadow.blur);
      shadowBlurVal.textContent = `${doc.shadow.blur}px`;
      shadowOffsetX.value = String(doc.shadow.offsetX);
      shadowOffsetXVal.textContent = `${doc.shadow.offsetX}px`;
      shadowOffsetY.value = String(doc.shadow.offsetY);
      shadowOffsetYVal.textContent = `${doc.shadow.offsetY}px`;
    } else {
      shadowToggle.checked = false;
    }

    // Curve
    curveToggle.checked = !!doc.curve?.enabled;
    const deg = doc.curve?.amount ?? 140;
    curveAmount.value = String(deg);
    curveAmountVal.textContent = `${deg}°`;

    // Fill
    if (doc.fill && doc.fill.type === "gradient") {
      gradientToggle.checked = true;
      gradColor1.value = this.normalizeHexColor(doc.fill.color1);
      gradColor2.value = this.normalizeHexColor(doc.fill.color2);
      gradAngle.value = String(doc.fill.angle);
      gradAngleVal.textContent = `${doc.fill.angle}°`;
    } else {
      gradientToggle.checked = false;
    }

    selectionInfo.textContent = `Selected: ${state.fontFamily} (${Math.round(node.width())}×${Math.round(node.height())}px)`;
  }

  private normalizeHexColor(c: string): string {
    if (!c) return "#000000";
    if (c.startsWith("#") && c.length === 7) return c;
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = c;
    return ctx.fillStyle;
  }

  private setupListeners() {
    // Prevent focus loss when clicking toolbar buttons
    document.querySelectorAll(".prevent-blur, #toolbar, #inspector-panel").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, .btn, [role='button']")) {
          e.preventDefault();
        }
      });
    });

    // Font Family
    const fontSelect = this.byId<HTMLSelectElement>("toolbar-font");
    fontSelect.onchange = () => {
      this.currentNode?.setFontFamily(fontSelect.value);
      this.canvasManager.saveHistory();
      fontSelect.blur();
    };

    // Font Size
    const fontSizeInput = this.byId<HTMLInputElement>("toolbar-size");
    fontSizeInput.onchange = () => {
      const val = parseInt(fontSizeInput.value, 10);
      if (!isNaN(val) && val > 0) {
        this.currentNode?.setFontSize(val);
        this.canvasManager.saveHistory();
      }
      fontSizeInput.blur();
    };

    this.byId("btn-size-minus").onclick = () => {
      this.currentNode?.scaleFontSize(0.9);
      this.canvasManager.saveHistory();
    };

    this.byId("btn-size-plus").onclick = () => {
      this.currentNode?.scaleFontSize(1.1);
      this.canvasManager.saveHistory();
    };

    // Font Weight
    const fontWeightSelect = this.byId<HTMLSelectElement>("toolbar-weight");
    fontWeightSelect.onchange = () => {
      const w = parseInt(fontWeightSelect.value, 10);
      if (!isNaN(w)) {
        this.currentNode?.setFontWeight(w);
        this.canvasManager.saveHistory();
      }
      fontWeightSelect.blur();
    };

    // Toggles
    this.byId("btn-bold").onclick = () => {
      this.currentNode?.toggleBold();
      this.canvasManager.saveHistory();
    };
    this.byId("btn-italic").onclick = () => {
      this.currentNode?.toggleItalic();
      this.canvasManager.saveHistory();
    };
    this.byId("btn-underline").onclick = () => {
      this.currentNode?.toggleUnderline();
      this.canvasManager.saveHistory();
    };
    this.byId("btn-strike").onclick = () => {
      this.currentNode?.toggleStrikethrough();
      this.canvasManager.saveHistory();
    };

    // Text Color
    const colorPicker = this.byId<HTMLInputElement>("toolbar-color");
    colorPicker.oninput = () => {
      this.currentNode?.setColor(colorPicker.value);
      this.byId<HTMLDivElement>("toolbar-color-swatch").style.backgroundColor = colorPicker.value;
    };
    colorPicker.onchange = () => {
      this.canvasManager.saveHistory();
      colorPicker.blur();
    };

    // Swatches
    document.querySelectorAll<HTMLButtonElement>("[data-swatch-color]").forEach((btn) => {
      btn.onclick = () => {
        const color = btn.dataset.swatchColor!;
        this.currentNode?.setColor(color);
        colorPicker.value = this.normalizeHexColor(color);
        this.byId<HTMLDivElement>("toolbar-color-swatch").style.backgroundColor = color;
        this.canvasManager.saveHistory();
      };
    });

    // Alignments
    document.querySelectorAll<HTMLButtonElement>("[data-align]").forEach((btn) => {
      btn.onclick = () => {
        const align = btn.dataset.align as "left" | "center" | "right" | "justify";
        this.currentNode?.setAlignment(align);
        this.canvasManager.saveHistory();
      };
    });

    // Lists
    this.byId("btn-bullets").onclick = () => {
      this.currentNode?.toggleBulletList("disc");
      this.canvasManager.saveHistory();
    };
    this.byId("btn-numbers").onclick = () => {
      this.currentNode?.toggleBulletList("decimal");
      this.canvasManager.saveHistory();
    };
    this.byId("btn-stars").onclick = () => {
      this.currentNode?.toggleBulletList("★");
      this.canvasManager.saveHistory();
    };

    // Undo / Redo
    this.byId("btn-undo").onclick = () => this.canvasManager.undo();
    this.byId("btn-redo").onclick = () => this.canvasManager.redo();

    // Outline / Stroke
    const strokeWidth = this.byId<HTMLInputElement>("stroke-width");
    const strokeWidthVal = this.byId<HTMLSpanElement>("stroke-width-val");
    strokeWidth.oninput = () => {
      const val = parseInt(strokeWidth.value, 10);
      strokeWidthVal.textContent = `${val}px`;
      this.currentNode?.setStrokeWidth(val);
    };
    strokeWidth.onchange = () => this.canvasManager.saveHistory();

    const strokeColor = this.byId<HTMLInputElement>("stroke-color");
    strokeColor.oninput = () => {
      this.currentNode?.setStrokeColor(strokeColor.value);
      this.byId<HTMLDivElement>("stroke-color-swatch").style.backgroundColor = strokeColor.value;
    };
    strokeColor.onchange = () => this.canvasManager.saveHistory();

    // Drop Shadow
    const shadowToggle = this.byId<HTMLInputElement>("shadow-toggle");
    const shadowColor = this.byId<HTMLInputElement>("shadow-color");
    const shadowBlur = this.byId<HTMLInputElement>("shadow-blur");
    const shadowOffsetX = this.byId<HTMLInputElement>("shadow-offset-x");
    const shadowOffsetY = this.byId<HTMLInputElement>("shadow-offset-y");

    const applyShadow = () => {
      if (!shadowToggle.checked) {
        this.currentNode?.setShadow(null);
      } else {
        this.currentNode?.setShadow({
          color: shadowColor.value,
          blur: parseInt(shadowBlur.value, 10),
          offsetX: parseInt(shadowOffsetX.value, 10),
          offsetY: parseInt(shadowOffsetY.value, 10),
        });
      }
    };

    shadowToggle.onchange = () => {
      applyShadow();
      this.canvasManager.saveHistory();
    };
    shadowColor.oninput = applyShadow;
    shadowColor.onchange = () => this.canvasManager.saveHistory();

    shadowBlur.oninput = () => {
      this.byId<HTMLSpanElement>("shadow-blur-val").textContent = `${shadowBlur.value}px`;
      if (shadowToggle.checked) applyShadow();
    };
    shadowBlur.onchange = () => this.canvasManager.saveHistory();

    shadowOffsetX.oninput = () => {
      this.byId<HTMLSpanElement>("shadow-offset-x-val").textContent = `${shadowOffsetX.value}px`;
      if (shadowToggle.checked) applyShadow();
    };
    shadowOffsetX.onchange = () => this.canvasManager.saveHistory();

    shadowOffsetY.oninput = () => {
      this.byId<HTMLSpanElement>("shadow-offset-y-val").textContent = `${shadowOffsetY.value}px`;
      if (shadowToggle.checked) applyShadow();
    };
    shadowOffsetY.onchange = () => this.canvasManager.saveHistory();

    // Curved Text
    const curveToggle = this.byId<HTMLInputElement>("curve-toggle");
    const curveAmount = this.byId<HTMLInputElement>("curve-amount");
    const curveAmountVal = this.byId<HTMLSpanElement>("curve-amount-val");

    curveToggle.onchange = () => {
      if (curveToggle.checked) {
        this.currentNode?.setCurveAmount(parseInt(curveAmount.value, 10));
      } else {
        this.currentNode?.toggleCurve();
      }
      this.canvasManager.saveHistory();
    };

    curveAmount.oninput = () => {
      const val = parseInt(curveAmount.value, 10);
      curveAmountVal.textContent = `${val}°`;
      if (curveToggle.checked) {
        this.currentNode?.setCurveAmount(val);
      }
    };
    curveAmount.onchange = () => this.canvasManager.saveHistory();

    // Spacing
    const lineHeight = this.byId<HTMLInputElement>("line-height");
    lineHeight.oninput = () => {
      const val = parseFloat(lineHeight.value);
      this.byId<HTMLSpanElement>("line-height-val").textContent = `${val.toFixed(1)}x`;
      this.currentNode?.setLineHeight(val);
    };
    lineHeight.onchange = () => this.canvasManager.saveHistory();

    const letterSpacing = this.byId<HTMLInputElement>("letter-spacing");
    letterSpacing.oninput = () => {
      const val = parseInt(letterSpacing.value, 10);
      this.byId<HTMLSpanElement>("letter-spacing-val").textContent = `${val}px`;
      this.currentNode?.setLetterSpacing(val);
    };
    letterSpacing.onchange = () => this.canvasManager.saveHistory();

    const paragraphSpacing = this.byId<HTMLInputElement>("paragraph-spacing");
    paragraphSpacing.oninput = () => {
      const val = parseFloat(paragraphSpacing.value);
      this.byId<HTMLSpanElement>("paragraph-spacing-val").textContent = `${val.toFixed(1)}x`;
      this.currentNode?.setParagraphSpacing(val);
    };
    paragraphSpacing.onchange = () => this.canvasManager.saveHistory();

    // Gradient Fill
    const gradientToggle = this.byId<HTMLInputElement>("gradient-toggle");
    const gradColor1 = this.byId<HTMLInputElement>("grad-color-1");
    const gradColor2 = this.byId<HTMLInputElement>("grad-color-2");
    const gradAngle = this.byId<HTMLInputElement>("grad-angle");

    const applyGradient = () => {
      if (!gradientToggle.checked) {
        this.currentNode?.setFill(null);
      } else {
        this.currentNode?.setFill({
          type: "gradient",
          color1: gradColor1.value,
          color2: gradColor2.value,
          angle: parseInt(gradAngle.value, 10),
        });
      }
    };

    gradientToggle.onchange = () => {
      applyGradient();
      this.canvasManager.saveHistory();
    };
    gradColor1.oninput = applyGradient;
    gradColor1.onchange = () => this.canvasManager.saveHistory();
    gradColor2.oninput = applyGradient;
    gradColor2.onchange = () => this.canvasManager.saveHistory();
    gradAngle.oninput = () => {
      this.byId<HTMLSpanElement>("grad-angle-val").textContent = `${gradAngle.value}°`;
      if (gradientToggle.checked) applyGradient();
    };
    gradAngle.onchange = () => this.canvasManager.saveHistory();

    // Looks Presets
    LOOK_PRESETS.forEach((preset) => {
      const btn = document.getElementById(`look-${preset.id}`);
      if (btn) {
        btn.onclick = () => this.applyLookPreset(preset);
      }
    });

    // Story Mode
    this.byId("btn-story-mode").onclick = () => {
      const node = this.canvasManager.getSelected();
      if (node) {
        this.canvasManager.startInlineEditing(node);
      }
    };

    // Box Operations
    this.byId("btn-duplicate").onclick = () => this.canvasManager.duplicateSelected();
    this.byId("btn-bring-forward").onclick = () => this.canvasManager.bringForward();
    this.byId("btn-send-backward").onclick = () => this.canvasManager.sendBackward();
    this.byId("btn-delete").onclick = () => this.canvasManager.deleteSelected();
  }

  public applyLookPreset(preset: LookPreset) {
    const node = this.canvasManager.getSelected();
    if (!node) return;

    const f = this.currentState?.fontSize ?? 36;
    node.setColor(preset.color);

    if (preset.strokeWidthRatio !== undefined && preset.strokeColor) {
      const w = Math.max(1, Math.round(preset.strokeWidthRatio * f));
      node.setStrokeColor(preset.strokeColor);
      node.setStrokeWidth(w);
    } else if (preset.fixedStrokeWidth !== undefined) {
      if (preset.strokeColor) node.setStrokeColor(preset.strokeColor);
      node.setStrokeWidth(preset.fixedStrokeWidth);
    } else {
      node.setStrokeWidth(0);
    }

    if (preset.shadow) {
      const ox = preset.shadow.offsetXRatio !== undefined ? Math.round(preset.shadow.offsetXRatio * f) : (preset.shadow.fixedOffsetX ?? 0);
      const oy = preset.shadow.offsetYRatio !== undefined ? Math.round(preset.shadow.offsetYRatio * f) : (preset.shadow.fixedOffsetY ?? 0);
      const blur = preset.shadow.blurRatio !== undefined ? Math.round(preset.shadow.blurRatio * f) : (preset.shadow.fixedBlur ?? 0);

      node.setShadow({
        color: preset.shadow.color,
        offsetX: ox,
        offsetY: oy,
        blur,
      });
    } else {
      node.setShadow(null);
    }

    if (preset.fill) {
      node.setFill(preset.fill);
    }

    this.canvasManager.saveHistory();
    this.canvasManager.emitFormattingChange();
  }

  private setupShortcuts() {
    window.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl) {
        const key = e.key.toLowerCase();
        if (key === "b") {
          e.preventDefault();
          this.currentNode?.toggleBold();
          this.canvasManager.saveHistory();
        } else if (key === "i") {
          e.preventDefault();
          this.currentNode?.toggleItalic();
          this.canvasManager.saveHistory();
        } else if (key === "u") {
          e.preventDefault();
          this.currentNode?.toggleUnderline();
          this.canvasManager.saveHistory();
        } else if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            this.canvasManager.redo();
          } else {
            this.canvasManager.undo();
          }
        } else if (key === "y") {
          e.preventDefault();
          this.canvasManager.redo();
        } else if (key === "s") {
          e.preventDefault();
          const btn = document.getElementById("btn-save-project-direct");
          if (btn) btn.click();
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (this.canvasManager.getSelectedNode() && !this.canvasManager.isEditing()) {
          e.preventDefault();
          this.canvasManager.deleteSelected();
        }
      }
    });
  }
}
