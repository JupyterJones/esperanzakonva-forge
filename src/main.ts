import { CanvasManager } from "./canvas-manager";
import { ToolbarController } from "./toolbar-controller";
import { MotionEffectsManager, MotionEffectType } from "./motion-effects";
import { AtmosphericEffectKey } from "./atmospheric-fx";
import { TEMPLATES, LOOK_PRESETS } from "./presets";
import { ForgeImageNode } from "./forge-image-node";
import {
  createForgeImageFromFile,
  createForgeImageFromDataUrl,
  createAnimatedRecBadge,
  createAnimatedCyberRing,
  createTransparentLiveBadge,
  createTransparentSubscribeButton,
  createTransparent4kSeal,
  createTransparentVerifiedBadge,
} from "./media-loader";
import {
  SAMPLE_VIDEO_INTRO,
  SAMPLE_CURVED_CINEMA,
  SAMPLE_AURORA_BOX,
} from "./sample-json";
import {
  createIcons,
  Flame,
  BookOpen,
  Minimize2,
  Code,
  Keyboard,
  Trash2,
  Trash,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Copy,
  BringToFront,
  SendToBack,
  PlusCircle,
  LayoutTemplate,
  Sparkles,
  Wand2,
  ZoomOut,
  ZoomIn,
  Sliders,
  Image,
  FileJson,
  Check,
  Plus,
  ExternalLink,
  Clapperboard,
  Play,
  Pause,
  Film,
  Video,
  Type,
  RotateCcw,
  Upload,
  Crosshair,
  Zap,
} from "lucide";
import "./style.css";

const ICONS = {
  Flame,
  BookOpen,
  Minimize2,
  Code,
  Keyboard,
  Trash2,
  Trash,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Copy,
  BringToFront,
  SendToBack,
  PlusCircle,
  LayoutTemplate,
  Sparkles,
  Wand2,
  ZoomOut,
  ZoomIn,
  Sliders,
  Image,
  FileJson,
  Check,
  Plus,
  ExternalLink,
  Clapperboard,
  Play,
  Pause,
  Film,
  Video,
  Type,
  RotateCcw,
  Upload,
  Crosshair,
  Zap,
};

class EsperanzaKonvaForgeApp {
  private canvasManager: CanvasManager;
  private toolbarController: ToolbarController;
  private motionEffectsManager: MotionEffectsManager;

  constructor() {
    const canvasContainer = document.getElementById("konva-container") as HTMLDivElement;
    this.canvasManager = new CanvasManager(canvasContainer);
    this.toolbarController = new ToolbarController(this.canvasManager);
    this.motionEffectsManager = new MotionEffectsManager(this.canvasManager);

    this.renderLeftSidebar();
    this.setupTopNav();
    this.setupModals();
    this.setupCanvasControls();
    this.setupMotionFX();
    this.setupAtmosphericFX();
    this.setupMediaControls();

    // Load initial showcase template
    this.canvasManager.loadTemplate(TEMPLATES[0]);

    // Initialize icons
    createIcons({ icons: ICONS });
  }

  private renderLeftSidebar() {
    // 1. Tab Switching
    const tabBtns = document.querySelectorAll<HTMLButtonElement>("[data-tab-target]");
    const tabPanes = document.querySelectorAll<HTMLElement>("[data-tab-pane]");

    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const target = btn.dataset.tabTarget!;
        tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
        tabPanes.forEach((p) => p.classList.toggle("hidden", p.dataset.tabPane !== target));
      };
    });

    // 2. Elements Tab Add Buttons
    document.getElementById("add-heading")!.onclick = () => {
      this.canvasManager.addText("Forge Your Headline", 56, {
        fontFamily: "Poppins",
        bold: true,
        color: "#F8FAFC",
      });
    };

    document.getElementById("add-subhead")!.onclick = () => {
      this.canvasManager.addText("Crafted Subheading with Elegance", 28, {
        fontFamily: "Lora",
        italic: true,
        color: "#CBD5E1",
      });
    };

    document.getElementById("add-body")!.onclick = () => {
      this.canvasManager.addText(
        "Double click to edit text inline. You have complete typography freedom with bold words, custom fonts, colors, and zero watermarks.",
        18,
        {
          fontFamily: "Poppins",
          color: "#94A3B8",
        }
      );
    };

    document.getElementById("add-curved")!.onclick = () => {
      this.canvasManager.addText("★ ESPERANZA KONVA FORGE ★", 26, {
        fontFamily: "Playfair Display",
        bold: true,
        color: "#00F0FF",
        curveAmount: 140,
      });
    };

    document.getElementById("add-bullet-list")!.onclick = () => {
      const node = this.canvasManager.addText(
        "Zero license restrictions or watermarks\nNative vector Canvas 2D precision\nFull inline rich text editing",
        18,
        {
          fontFamily: "Poppins",
          color: "#E2E8F0",
        }
      );
      node.toggleBulletList("★");
      this.canvasManager.saveHistory();
    };

    // 3. Templates Tab
    const templateContainer = document.getElementById("templates-list")!;
    templateContainer.innerHTML = TEMPLATES.map(
      (tpl) => `
      <div class="template-card" data-template-id="${tpl.id}" style="border-left: 4px solid ${tpl.thumbnailColor};">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-slate-200 text-sm">${tpl.name}</span>
          <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${tpl.category}</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">${tpl.description}</p>
        <button class="btn btn-sm btn-outline w-full text-xs font-semibold hover:border-orange-500/50 hover:text-orange-300" data-load-template="${tpl.id}">
          Forge Template
        </button>
      </div>
    `
    ).join("");

    templateContainer.querySelectorAll<HTMLButtonElement>("[data-load-template]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.loadTemplate;
        const tpl = TEMPLATES.find((t) => t.id === id);
        if (tpl) {
          this.canvasManager.loadTemplate(tpl);
        }
      };
    });

    // 4. Looks Tab
    const looksContainer = document.getElementById("looks-list")!;
    looksContainer.innerHTML = LOOK_PRESETS.map(
      (preset) => `
      <button id="look-${preset.id}" class="look-preset-btn flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-orange-500/50 bg-[#121622] hover:bg-[#181F30] transition-all shadow-sm group w-full text-left cursor-pointer">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm" style="background-color: ${preset.color}; color: ${preset.strokeColor || '#0B0E17'}; border: 2px solid ${preset.strokeColor || 'transparent'}">
            Aa
          </div>
          <span class="text-xs font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">${preset.name}</span>
        </div>
        <i data-lucide="sparkles" class="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors"></i>
      </button>
    `
    ).join("");

    // 5. Forge FX Tab
    document.getElementById("fx-rainbow-gradient")?.addEventListener("click", () => {
      const node = this.canvasManager.getSelected();
      if (node) {
        node.setFill({
          type: "gradient",
          color1: "#8B5CF6",
          color2: "#EC4899",
          angle: 45,
        });
        this.canvasManager.saveHistory();
        this.canvasManager.emitFormattingChange();
      }
    });

    document.getElementById("fx-curved-seal")?.addEventListener("click", () => {
      const node = this.canvasManager.getSelected();
      if (node) {
        node.setCurveAmount(180);
        this.canvasManager.saveHistory();
        this.canvasManager.emitFormattingChange();
      }
    });

    document.getElementById("fx-gold-glow")?.addEventListener("click", () => {
      const node = this.canvasManager.getSelected();
      if (node) {
        node.setColor("#D97706");
        node.setStrokeColor("#78350F");
        node.setStrokeWidth(3);
        node.setShadow({
          color: "#F59E0B",
          blur: 16,
          offsetX: 0,
          offsetY: 0,
        });
        this.canvasManager.saveHistory();
        this.canvasManager.emitFormattingChange();
      }
    });
  }

  private setupTopNav() {
    // Copyfit demo
    document.getElementById("btn-copyfit-demo")!.onclick = () => {
      const node = this.canvasManager.getSelected();
      if (!node) {
        alert("Please select a text box on the canvas to run the Shrink-to-Fit demo.");
        return;
      }
      const scale = this.canvasManager.runCopyfitDemo(95);
      if (scale) {
        alert(`Shrink-to-Fit applied! Scaled font sizes to ${(scale * 100).toFixed(1)}% to fit 95px container height cleanly.`);
      }
    };

    // Clear Canvas
    document.getElementById("btn-clear-canvas")!.onclick = () => {
      if (confirm("Are you sure you want to clear the canvas?")) {
        this.canvasManager.clearStage();
      }
    };

    // Animated FX Menu Button
    document.getElementById("btn-animated-fx-menu")?.addEventListener("click", () => {
      const fxTabBtn = document.querySelector<HTMLButtonElement>('[data-tab-target="fx"]');
      if (fxTabBtn) {
        fxTabBtn.click();
      }
      if (!this.motionEffectsManager.getIsPlaying()) {
        if (this.motionEffectsManager.getActiveEffects().length === 0) {
          this.motionEffectsManager.toggleEffect("neon-pulse");
        } else {
          this.motionEffectsManager.play();
        }
      }
    });

    // Zoom Controls
    document.getElementById("btn-zoom-in")!.onclick = () => {
      this.canvasManager.zoomIn();
      this.updateZoomDisplay();
    };

    document.getElementById("btn-zoom-out")!.onclick = () => {
      this.canvasManager.zoomOut();
      this.updateZoomDisplay();
    };

    document.getElementById("btn-zoom-reset")!.onclick = () => {
      this.canvasManager.resetZoom();
      this.updateZoomDisplay();
    };
  }

  private updateZoomDisplay() {
    const zoomVal = document.getElementById("zoom-val");
    if (zoomVal) {
      zoomVal.textContent = `${Math.round(this.canvasManager.getZoom() * 100)}%`;
    }
  }

  private setupCanvasControls() {
    const bgInput = document.getElementById("canvas-bg-picker") as HTMLInputElement;
    bgInput.oninput = () => {
      this.canvasManager.setCanvasBackground(bgInput.value);
    };

    document.querySelectorAll<HTMLButtonElement>("[data-canvas-bg]").forEach((btn) => {
      btn.onclick = () => {
        const color = btn.dataset.canvasBg!;
        this.canvasManager.setCanvasBackground(color);
        bgInput.value = color;
      };
    });

    // Video Aspect Ratio / Format Selector
    const aspectBtns = document.querySelectorAll<HTMLButtonElement>("[data-aspect]");
    aspectBtns.forEach((btn) => {
      btn.onclick = () => {
        aspectBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const aspect = btn.dataset.aspect;
        switch (aspect) {
          case "16-9":
            this.canvasManager.setAspectRatio(960, 540); // 16:9 Widescreen Full HD (1920x1080)
            break;
          case "21-9":
            this.canvasManager.setAspectRatio(1050, 450); // 21:9 UltraWide Cinema (2560x1080)
            break;
          case "9-16":
            this.canvasManager.setAspectRatio(405, 720); // 9:16 Vertical Video (1080x1920)
            break;
          case "4-5":
            this.canvasManager.setAspectRatio(480, 600); // 4:5 Social Feed Video (1080x1350)
            break;
          case "1-1":
            this.canvasManager.setAspectRatio(600, 600); // 1:1 Square (1080x1080)
            break;
          case "4-3":
            this.canvasManager.setAspectRatio(720, 540); // 4:3 Classic TV & Tablet (1440x1080)
            break;
          case "3-1":
            this.canvasManager.setAspectRatio(960, 320); // 3:1 Web Banner & Channel Header (1920x640)
            break;
          default:
            this.canvasManager.setAspectRatio(960, 540);
            break;
        }
      };
    });
  }

  private setupModals() {
    // JSON Modal
    const jsonModal = document.getElementById("json-modal")!;
    const jsonEditor = document.getElementById("json-editor-content") as HTMLTextAreaElement;
    const tabCanvas = document.getElementById("btn-json-tab-canvas")!;
    const tabBox = document.getElementById("btn-json-tab-box")!;
    const statusBadge = document.getElementById("json-status-badge")!;
    const applyBtnText = document.getElementById("btn-apply-json-text")!;

    const setEditorMode = (mode: "canvas" | "box") => {
      if (mode === "canvas") {
        tabCanvas.className =
          "px-2.5 py-1 text-xs rounded font-medium text-orange-300 bg-orange-500/20 border border-orange-500/30 transition-all";
        tabBox.className =
          "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-slate-200 border border-transparent transition-all";
        jsonEditor.value = this.canvasManager.exportJSON();
        statusBadge.textContent = "Full Canvas Project Schema ({ canvas, boxes })";
        statusBadge.className =
          "absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/30 pointer-events-none";
        applyBtnText.textContent = "Apply to Canvas";
      } else {
        tabBox.className =
          "px-2.5 py-1 text-xs rounded font-medium text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 transition-all";
        tabCanvas.className =
          "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-slate-200 border border-transparent transition-all";
        const node = this.canvasManager.getSelected();
        if (node) {
          jsonEditor.value = JSON.stringify(node.getDocument(), null, 2);
          statusBadge.textContent = "Selected Text Box Schema ({ blocks })";
        } else {
          jsonEditor.value = JSON.stringify(SAMPLE_AURORA_BOX, null, 2);
          statusBadge.textContent = "Text Box Schema (Ready to create new box)";
        }
        statusBadge.className =
          "absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 pointer-events-none";
        applyBtnText.textContent = "Apply to Text Box";
      }
    };

    document.getElementById("btn-view-json")!.onclick = () => {
      const node = this.canvasManager.getSelected();
      setEditorMode(node ? "box" : "canvas");
      jsonModal.classList.remove("hidden");
    };

    document.getElementById("btn-close-json-modal")!.onclick = () => {
      jsonModal.classList.add("hidden");
    };

    tabCanvas.onclick = () => setEditorMode("canvas");
    tabBox.onclick = () => setEditorMode("box");

    // Quick Test Sample Loaders
    document.getElementById("btn-load-sample-video")!.onclick = () => {
      tabCanvas.className =
        "px-2.5 py-1 text-xs rounded font-medium text-orange-300 bg-orange-500/20 border border-orange-500/30 transition-all";
      tabBox.className =
        "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-slate-200 border border-transparent transition-all";
      jsonEditor.value = JSON.stringify(SAMPLE_VIDEO_INTRO, null, 2);
      statusBadge.textContent = "Loaded: 16:9 Kinetic Video Intro Preset";
      statusBadge.className =
        "absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/30 pointer-events-none";
      applyBtnText.textContent = "Apply to Canvas";
    };

    document.getElementById("btn-load-sample-cinema")!.onclick = () => {
      tabCanvas.className =
        "px-2.5 py-1 text-xs rounded font-medium text-amber-300 bg-amber-500/20 border border-amber-500/30 transition-all";
      tabBox.className =
        "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-slate-200 border border-transparent transition-all";
      jsonEditor.value = JSON.stringify(SAMPLE_CURVED_CINEMA, null, 2);
      statusBadge.textContent = "Loaded: Curved Cinema Title Preset";
      statusBadge.className =
        "absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 pointer-events-none";
      applyBtnText.textContent = "Apply to Canvas";
    };

    document.getElementById("btn-load-sample-aurora")!.onclick = () => {
      tabBox.className =
        "px-2.5 py-1 text-xs rounded font-medium text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 transition-all";
      tabCanvas.className =
        "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-slate-200 border border-transparent transition-all";
      jsonEditor.value = JSON.stringify(SAMPLE_AURORA_BOX, null, 2);
      statusBadge.textContent = "Loaded: Aurora Gradient Text Box Preset";
      statusBadge.className =
        "absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 pointer-events-none";
      applyBtnText.textContent = "Apply to Text Box";
    };

    document.getElementById("btn-copy-json")!.onclick = () => {
      navigator.clipboard.writeText(jsonEditor.value);
      const prevText = statusBadge.textContent;
      statusBadge.textContent = "Copied JSON to clipboard!";
      setTimeout(() => {
        statusBadge.textContent = prevText;
      }, 2000);
    };

    document.getElementById("btn-format-json")!.onclick = () => {
      try {
        const parsed = JSON.parse(jsonEditor.value);
        jsonEditor.value = JSON.stringify(parsed, null, 2);
        statusBadge.textContent = "JSON Formatted & Prettified";
      } catch (err) {
        alert("Cannot format: JSON syntax error: " + String(err));
      }
    };

    document.getElementById("btn-apply-json")!.onclick = () => {
      try {
        const parsed = JSON.parse(jsonEditor.value);
        const node = this.canvasManager.getSelected();

        if (parsed.boxes && Array.isArray(parsed.boxes)) {
          const success = this.canvasManager.importJSON(jsonEditor.value);
          if (success) {
            const selected = this.canvasManager.getSelected();
            this.toolbarController.updateUI(selected?.getFormattingState() ?? null, selected);
            jsonModal.classList.add("hidden");
          } else {
            alert("Error importing canvas JSON design. Please check structure.");
          }
        } else if (parsed.blocks && Array.isArray(parsed.blocks)) {
          if (node) {
            node.setDocument(parsed);
            this.canvasManager.saveHistory();
            this.toolbarController.updateUI(node.getFormattingState(), node);
          } else {
            const newBox = this.canvasManager.addDocumentBox(parsed);
            this.toolbarController.updateUI(newBox.getFormattingState(), newBox);
          }
          jsonModal.classList.add("hidden");
        } else {
          alert("Unrecognized JSON format. Must contain either 'boxes' array (Canvas Project) or 'blocks' array (Text Box Document).");
        }
      } catch (err) {
        alert("JSON syntax error: " + String(err));
      }
    };

    // Export Modal
    const exportModal = document.getElementById("export-modal")!;
    const exportPreviewImg = document.getElementById("export-preview-img") as HTMLImageElement;

    document.getElementById("btn-export")!.onclick = () => {
      const pngUrl = this.canvasManager.exportPNG();
      exportPreviewImg.src = pngUrl;
      exportModal.classList.remove("hidden");
    };

    document.getElementById("btn-close-export-modal")!.onclick = () => {
      exportModal.classList.add("hidden");
    };

    document.getElementById("btn-download-png")!.onclick = () => {
      const pngUrl = this.canvasManager.exportPNG();
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "esperanza-konva-forge-artwork.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    document.getElementById("btn-download-json")!.onclick = () => {
      const json = this.canvasManager.exportJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "esperanza-konva-forge-document.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Shortcuts Modal
    const shortcutsModal = document.getElementById("shortcuts-modal")!;
    document.getElementById("btn-shortcuts")!.onclick = () => {
      shortcutsModal.classList.remove("hidden");
    };
    document.getElementById("btn-close-shortcuts-modal")!.onclick = () => {
      shortcutsModal.classList.add("hidden");
    };
  }

  private setupMotionFX() {
    const statusBadge = document.getElementById("motion-status-badge");
    const playToggleBtn = document.getElementById("btn-motion-toggle");
    const playToggleText = document.getElementById("btn-motion-toggle-text");
    const speedSlider = document.getElementById("motion-speed") as HTMLInputElement | null;
    const speedVal = document.getElementById("motion-speed-val");
    const intensitySlider = document.getElementById("motion-intensity") as HTMLInputElement | null;
    const intensityVal = document.getElementById("motion-intensity-val");

    if (!statusBadge || !playToggleBtn || !playToggleText) return;

    // Playback state updates
    this.motionEffectsManager.setOnStateChange((isPlaying, activeEffects) => {
      if (isPlaying && activeEffects.length > 0) {
        const summary = activeEffects.length === 1 
          ? activeEffects[0].replace("-", " ").toUpperCase() 
          : `${activeEffects.length} FX ACTIVE`;
        statusBadge.textContent = `LIVE: ${summary}`;
        statusBadge.className = "fx-badge-live";
        playToggleText.textContent = "Pause Motion";
        playToggleBtn.className = "btn-motion-play playing";
      } else {
        statusBadge.textContent = activeEffects.length === 0 ? "NO FX ACTIVE" : "PAUSED";
        statusBadge.className = "fx-badge-paused";
        playToggleText.textContent = activeEffects.length === 0 ? "Play Default FX" : "Resume Motion";
        playToggleBtn.className = "btn-motion-play";
      }

      // Update active preset button highlight (support multi-active states!)
      document.querySelectorAll<HTMLButtonElement>("[data-motion-preset]").forEach((btn) => {
        const effect = btn.dataset.motionPreset as MotionEffectType;
        if (effect === "none") {
          btn.classList.toggle("active", activeEffects.length === 0);
        } else {
          btn.classList.toggle("active", isPlaying && activeEffects.includes(effect));
        }
      });
    });

    // Toggle button
    playToggleBtn.onclick = () => {
      this.motionEffectsManager.toggle();
    };

    // Speed slider
    if (speedSlider && speedVal) {
      speedSlider.oninput = () => {
        const spd = parseFloat(speedSlider.value);
        speedVal.textContent = `${spd.toFixed(2)}x`;
        this.motionEffectsManager.setSpeed(spd);
      };
    }

    // Intensity slider
    if (intensitySlider && intensityVal) {
      intensitySlider.oninput = () => {
        const int = parseFloat(intensitySlider.value);
        intensityVal.textContent = `${int.toFixed(1)}x`;
        this.motionEffectsManager.setIntensity(int);
      };
    }

    // Preset cards: click once to add/view, click again to remove!
    document.querySelectorAll<HTMLButtonElement>("[data-motion-preset]").forEach((btn) => {
      btn.onclick = () => {
        const effect = btn.dataset.motionPreset as MotionEffectType;
        this.motionEffectsManager.toggleEffect(effect);
      };
    });

    // Backdrop buttons
    const backdropTransparent = document.getElementById("backdrop-transparent");
    const backdropGreen = document.getElementById("backdrop-green");
    const backdropDark = document.getElementById("backdrop-dark");
    const backdropBtns = [backdropTransparent, backdropGreen, backdropDark];

    const setBackdropActive = (btn: HTMLElement | null) => {
      backdropBtns.forEach((b) => b?.classList.remove("active"));
      btn?.classList.add("active");
    };

    backdropTransparent?.addEventListener("click", () => {
      setBackdropActive(backdropTransparent);
      this.motionEffectsManager.setBackdropMode("transparent");
    });
    backdropGreen?.addEventListener("click", () => {
      setBackdropActive(backdropGreen);
      this.motionEffectsManager.setBackdropMode("green");
    });
    backdropDark?.addEventListener("click", () => {
      setBackdropActive(backdropDark);
      this.motionEffectsManager.setBackdropMode("dark");
    });

    // Duration buttons
    let recordDuration = 3;
    const durBtns = document.querySelectorAll<HTMLButtonElement>(".video-dur-btn");
    durBtns.forEach((btn) => {
      btn.onclick = () => {
        durBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        recordDuration = parseInt(btn.dataset.duration || "3", 10);
      };
    });

    // Record Video button
    const recordBtn = document.getElementById("btn-record-video");
    const recordBtnText = document.getElementById("btn-record-video-text");
    const progressBox = document.getElementById("video-record-progress-box");
    const percentEl = document.getElementById("video-record-percent");
    const barEl = document.getElementById("video-record-bar");

    if (recordBtn && recordBtnText && progressBox && percentEl && barEl) {
      recordBtn.onclick = async () => {
        try {
          recordBtn.setAttribute("disabled", "true");
          progressBox.classList.remove("hidden");
          recordBtnText.textContent = `Recording ${recordDuration}s Stream...`;

          await this.motionEffectsManager.recordVideo(recordDuration, (pct) => {
            percentEl.textContent = `${pct}%`;
            barEl.style.width = `${pct}%`;
          });

          recordBtnText.textContent = "Export Complete!";
          setTimeout(() => {
            recordBtnText.textContent = "Record Transparent Video (.webm)";
            progressBox.classList.add("hidden");
            percentEl.textContent = "0%";
            barEl.style.width = "0%";
            recordBtn.removeAttribute("disabled");
          }, 2000);
        } catch (err: any) {
          alert(`Recording error: ${err?.message || err}`);
          recordBtn.removeAttribute("disabled");
          progressBox.classList.add("hidden");
          recordBtnText.textContent = "Record Transparent Video (.webm)";
        }
      };
    }
  }

  private setupAtmosphericFX() {
    const atmManager = this.canvasManager.atmosphericFX;
    const badge = document.getElementById("atm-active-badge");
    const opacitySlider = document.getElementById("atm-opacity-slider") as HTMLInputElement | null;
    const opacityVal = document.getElementById("atm-opacity-val");
    const blendSelect = document.getElementById("atm-blend-mode") as HTMLSelectElement | null;
    const presetBtns = document.querySelectorAll<HTMLButtonElement>("[data-atm-preset]");
    const effectToggles = document.querySelectorAll<HTMLButtonElement>("[data-atm-effect]");

    const updateUI = () => {
      // 1. Update preset active state
      const currentPreset = atmManager.getCurrentPresetId();
      presetBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.atmPreset === currentPreset);
      });

      // 2. Update individual effect toggles
      let activeCount = 0;
      effectToggles.forEach((btn) => {
        const key = btn.dataset.atmEffect as AtmosphericEffectKey;
        const isEnabled = atmManager.effects[key]?.enabled;
        btn.classList.toggle("active", !!isEnabled);
        if (isEnabled) activeCount++;
      });

      // 3. Update active badge
      if (badge) {
        badge.textContent = `${activeCount} ACTIVE`;
        if (activeCount > 0) {
          badge.className = "px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse";
        } else {
          badge.className = "px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1A1208] border border-amber-500/40 text-amber-300";
        }
      }

      // 4. Update slider & blend mode values
      if (opacitySlider && opacityVal) {
        opacitySlider.value = String(atmManager.getMasterOpacity());
        opacityVal.textContent = `${Math.round(atmManager.getMasterOpacity() * 100)}%`;
      }
      if (blendSelect) {
        blendSelect.value = atmManager.getBlendMode();
      }
    };

    // Preset buttons click
    presetBtns.forEach((btn) => {
      btn.onclick = () => {
        const presetId = btn.dataset.atmPreset;
        if (!presetId) return;

        atmManager.applyPreset(presetId);
        updateUI();

        if (presetId !== "clean_slate" && !this.motionEffectsManager.getIsPlaying()) {
          this.motionEffectsManager.play();
        }
        this.canvasManager.mainLayer.batchDraw();
      };
    });

    // Individual effect toggle click
    effectToggles.forEach((btn) => {
      btn.onclick = () => {
        const key = btn.dataset.atmEffect as AtmosphericEffectKey;
        if (!key) return;

        const newState = atmManager.toggleEffect(key);
        updateUI();

        if (newState && !this.motionEffectsManager.getIsPlaying()) {
          this.motionEffectsManager.play();
        }
        this.canvasManager.mainLayer.batchDraw();
      };
    });

    // Master opacity slider
    if (opacitySlider && opacityVal) {
      opacitySlider.oninput = () => {
        const val = parseFloat(opacitySlider.value);
        opacityVal.textContent = `${Math.round(val * 100)}%`;
        atmManager.setMasterOpacity(val);
        this.canvasManager.mainLayer.batchDraw();
      };
    }

    // Blend composite mode select
    if (blendSelect) {
      blendSelect.onchange = () => {
        atmManager.setBlendMode(blendSelect.value as GlobalCompositeOperation);
        this.canvasManager.mainLayer.batchDraw();
      };
    }

    updateUI();
  }

  private setupMediaControls() {
    const fileInput = document.getElementById("media-file-input") as HTMLInputElement;
    const dropZone = document.getElementById("media-drop-zone");
    const headerAddBtn = document.getElementById("btn-add-media-header");

    const handleFile = async (file: File) => {
      try {
        const node = await createForgeImageFromFile(file);
        this.canvasManager.addImageNode(node);
      } catch (err) {
        alert("Could not load image file: " + String(err));
      }
    };

    if (headerAddBtn) {
      headerAddBtn.onclick = () => fileInput.click();
    }

    if (dropZone) {
      dropZone.onclick = () => fileInput.click();
      dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add("border-emerald-400");
      };
      dropZone.ondragleave = () => dropZone.classList.remove("border-emerald-400");
      dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-emerald-400");
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          handleFile(e.dataTransfer.files[0]);
        }
      };
    }

    fileInput.onchange = () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
        fileInput.value = "";
      }
    };

    // Canvas direct drag & drop support
    const container = document.getElementById("konva-container");
    if (container) {
      container.ondragover = (e) => e.preventDefault();
      container.ondrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          handleFile(e.dataTransfer.files[0]);
        }
      };
    }

    // Built-in Animated Stickers
    document.getElementById("btn-add-rec-sticker")?.addEventListener("click", () => {
      const frames = createAnimatedRecBadge();
      const node = new ForgeImageNode(
        {
          width: 260,
          height: 64,
          src: "built-in:animated-rec-badge",
          frames,
          isAnimated: true,
        },
        frames[0].canvas
      );
      this.canvasManager.addImageNode(node);
    });

    document.getElementById("btn-add-cyber-ring")?.addEventListener("click", () => {
      const frames = createAnimatedCyberRing();
      const node = new ForgeImageNode(
        {
          width: 180,
          height: 180,
          src: "built-in:animated-cyber-ring",
          frames,
          isAnimated: true,
        },
        frames[0].canvas
      );
      this.canvasManager.addImageNode(node);
    });

    // Built-in Transparent Vector Stickers
    document.getElementById("btn-add-live-badge")?.addEventListener("click", async () => {
      const dataUrl = createTransparentLiveBadge();
      const node = await createForgeImageFromDataUrl(dataUrl, { width: 180, height: 56 });
      this.canvasManager.addImageNode(node);
    });

    document.getElementById("btn-add-sub-badge")?.addEventListener("click", async () => {
      const dataUrl = createTransparentSubscribeButton();
      const node = await createForgeImageFromDataUrl(dataUrl, { width: 240, height: 64 });
      this.canvasManager.addImageNode(node);
    });

    document.getElementById("btn-add-4k-seal")?.addEventListener("click", async () => {
      const dataUrl = createTransparent4kSeal();
      const node = await createForgeImageFromDataUrl(dataUrl, { width: 170, height: 54 });
      this.canvasManager.addImageNode(node);
    });

    document.getElementById("btn-add-verified-badge")?.addEventListener("click", async () => {
      const dataUrl = createTransparentVerifiedBadge();
      const node = await createForgeImageFromDataUrl(dataUrl, { width: 160, height: 54 });
      this.canvasManager.addImageNode(node);
    });

    // Selected Graphic Controls
    const opacitySlider = document.getElementById("graphic-opacity-slider") as HTMLInputElement;
    const opacityVal = document.getElementById("graphic-opacity-val");
    const glowSlider = document.getElementById("graphic-glow-slider") as HTMLInputElement;
    const glowVal = document.getElementById("graphic-glow-val");

    opacitySlider?.addEventListener("input", () => {
      const img = this.canvasManager.getSelectedImage();
      const val = parseInt(opacitySlider.value, 10);
      if (opacityVal) opacityVal.textContent = `${val}%`;
      if (img) {
        img.setGraphicOpacity(val / 100);
      }
    });

    glowSlider?.addEventListener("input", () => {
      const img = this.canvasManager.getSelectedImage();
      const val = parseInt(glowSlider.value, 10);
      if (glowVal) glowVal.textContent = `${val}px`;
      if (img) {
        img.setGlow(val > 0 ? "#00F0FF" : "", val);
      }
    });

    document.getElementById("btn-center-graphic")?.addEventListener("click", () => {
      this.canvasManager.centerSelectedNode();
    });

    document.getElementById("btn-delete-graphic")?.addEventListener("click", () => {
      this.canvasManager.deleteSelected();
    });

    // Sync graphic controls when selection changes
    this.canvasManager.onImageSelectionCallback = (node) => {
      if (node) {
        if (opacitySlider) opacitySlider.value = String(Math.round(node.opacity() * 100));
        if (opacityVal) opacityVal.textContent = `${Math.round(node.opacity() * 100)}%`;
        if (glowSlider) glowSlider.value = String(node.konvaImage.shadowBlur() || 0);
        if (glowVal) glowVal.textContent = `${node.konvaImage.shadowBlur() || 0}px`;
      }
    };
  }
}

// Start EsperanzaKonva Forge
window.addEventListener("DOMContentLoaded", () => {
  new EsperanzaKonvaForgeApp();
});
