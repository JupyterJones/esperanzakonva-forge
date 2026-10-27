import Konva from "konva";
import { CanvasManager } from "./canvas-manager";
import { RichTextNode } from "./rich-text-engine";

export type MotionEffectType =
  | "none"
  | "neon-pulse"
  | "molten-shimmer"
  | "typewriter"
  | "float-breathe"
  | "cyber-glitch"
  | "wave-dance";

export type VideoBackdropMode = "dark" | "transparent" | "green";

export class MotionEffectsManager {
  private canvasManager: CanvasManager;
  private activeEffects = new Set<MotionEffectType>();
  private isPlaying = false;
  private animFrameId: number | null = null;
  private startTime = 0;
  private lastTickTime = 0;
  private speed = 1.0;
  private intensity = 1.0;
  private backdropMode: VideoBackdropMode = "dark";
  private origPositions = new Map<RichTextNode, { x: number; y: number; curve: number; scaleX: number; scaleY: number }>();
  private onStateChangeCallback?: (isPlaying: boolean, activeEffects: MotionEffectType[]) => void;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  public setOnStateChange(cb: (isPlaying: boolean, activeEffects: MotionEffectType[]) => void) {
    this.onStateChangeCallback = cb;
  }

  public getActiveEffects(): MotionEffectType[] {
    return Array.from(this.activeEffects);
  }

  public isEffectActive(effect: MotionEffectType): boolean {
    return this.activeEffects.has(effect);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(val: number) {
    this.speed = Math.max(0.25, Math.min(3.0, val));
  }

  public setIntensity(val: number) {
    this.intensity = Math.max(0.2, Math.min(3.0, val));
  }

  /**
   * Toggle an effect: Click once to activate, click again to remove.
   * Multiple effects can be combined simultaneously!
   */
  public toggleEffect(effect: MotionEffectType): boolean {
    if (effect === "none") {
      this.clearAllEffects();
      return false;
    }

    if (this.activeEffects.has(effect)) {
      // Remove effect
      this.activeEffects.delete(effect);
      this.cleanupSpecificEffect(effect);

      if (this.activeEffects.size === 0) {
        this.pause();
      } else {
        this.emitStateChange();
      }
      return false;
    } else {
      // Add effect to active stack
      this.activeEffects.add(effect);
      if (!this.isPlaying) {
        this.play();
      } else {
        this.emitStateChange();
      }
      return true;
    }
  }

  public clearAllEffects() {
    this.activeEffects.clear();
    this.pause();
    this.resetAllNodeEffects();
    this.restoreOrigPositions();
    this.emitStateChange();
  }

  public play() {
    if (this.isPlaying) return;
    if (this.activeEffects.size === 0 && !this.canvasManager.atmosphericFX.isAnyEffectActive()) {
      this.activeEffects.add("neon-pulse");
    }
    this.isPlaying = true;
    this.startTime = performance.now();
    this.lastTickTime = performance.now();
    this.snapshotOrigPositions();
    this.loop();
    this.emitStateChange();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.restoreOrigPositions();
    this.resetAllNodeEffects();
    this.emitStateChange();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private emitStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isPlaying, Array.from(this.activeEffects));
    }
  }

  private snapshotOrigPositions() {
    this.origPositions.clear();
    const boxes = this.canvasManager.getBoxes();
    for (const box of boxes) {
      this.origPositions.set(box, {
        x: box.x(),
        y: box.y(),
        curve: box.getDocument().curve?.amount ?? 140,
        scaleX: box.scaleX(),
        scaleY: box.scaleY(),
      });
    }
  }

  private restoreOrigPositions() {
    for (const [box, orig] of this.origPositions.entries()) {
      box.x(orig.x);
      box.y(orig.y);
      box.scaleX(orig.scaleX);
      box.scaleY(orig.scaleY);
      const doc = box.getDocument();
      if (doc.curve?.enabled) {
        box.setCurveAmount(orig.curve);
      }
    }
    this.canvasManager.mainLayer.batchDraw();
  }

  private cleanupSpecificEffect(effect: MotionEffectType) {
    const boxes = this.canvasManager.getBoxes();
    for (const box of boxes) {
      switch (effect) {
        case "neon-pulse":
          box.setAnimationState({ glowPulse: undefined });
          break;
        case "molten-shimmer":
          box.setAnimationState({ shimmerProgress: undefined });
          break;
        case "typewriter":
          box.setAnimationState({ typewriterChars: undefined });
          break;
        case "cyber-glitch":
          box.setAnimationState({ glitchOffset: undefined });
          break;
        case "float-breathe": {
          const orig = this.origPositions.get(box);
          if (orig) {
            box.y(orig.y);
            box.scaleX(orig.scaleX);
            box.scaleY(orig.scaleY);
          }
          break;
        }
        case "wave-dance": {
          const orig = this.origPositions.get(box);
          if (orig) {
            box.setCurveAmount(orig.curve);
          }
          break;
        }
        default:
          break;
      }
    }
    this.canvasManager.mainLayer.batchDraw();
  }

  private resetAllNodeEffects() {
    const boxes = this.canvasManager.getBoxes();
    for (const box of boxes) {
      box.clearAnimationState();
    }
    this.canvasManager.mainLayer.batchDraw();
  }

  private loop = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;
    const elapsed = (now - this.startTime) * this.speed;

    // Advance atmospheric procedural particle engines
    this.canvasManager.atmosphericFX.update(dt * this.speed);

    this.tick(elapsed);
    this.canvasManager.mainLayer.batchDraw();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Multi-effect compositing loop: each active effect contributes its motion pass simultaneously!
   */
  private tick(elapsedMs: number) {
    const boxes = this.canvasManager.getBoxes();
    if (boxes.length === 0 || this.activeEffects.size === 0) return;

    const t = elapsedMs * 0.001; // in seconds

    // 1. Neon Pulse pass
    const hasNeon = this.activeEffects.has("neon-pulse");
    const pulse = hasNeon ? ((Math.sin(t * 3.5) + 1) / 2) * this.intensity : undefined;

    // 2. Molten Shimmer pass
    const hasShimmer = this.activeEffects.has("molten-shimmer");
    const shimmerProgress = hasShimmer ? (t * 0.45 * this.intensity) % 1 : undefined;

    // 3. Typewriter Reveal pass
    const hasTypewriter = this.activeEffects.has("typewriter");
    const cycleDuration = 4.5 / this.speed;
    const typingDuration = 2.8 / this.speed;
    const cycleProgress = t % cycleDuration;

    // 4. Cyber Glitch pass
    const hasGlitch = this.activeEffects.has("cyber-glitch");
    const isGlitchFrame = hasGlitch && Math.random() < 0.18 * this.intensity;
    const glitchOffset = isGlitchFrame
      ? {
          x: (Math.random() - 0.5) * 10 * this.intensity,
          y: (Math.random() - 0.5) * 5 * this.intensity,
        }
      : undefined;

    // 5. Float & Breathe pass
    const hasFloat = this.activeEffects.has("float-breathe");
    const bob = hasFloat ? Math.sin(t * 2.5) * 8 * this.intensity : 0;
    const scaleDelta = hasFloat ? Math.sin(t * 2.5) * 0.03 * this.intensity : 0;

    // 6. Wave Dance pass
    const hasWave = this.activeEffects.has("wave-dance");
    const wave = hasWave ? Math.sin(t * 2.2) * 35 * this.intensity : 0;

    // Apply passes to each box
    for (const box of boxes) {
      const orig = this.origPositions.get(box);

      // Animation state object for shader / canvas passes
      const animStateUpdate: any = {};

      if (hasNeon) {
        animStateUpdate.glowPulse = pulse;
      }
      if (hasShimmer) {
        animStateUpdate.shimmerProgress = shimmerProgress;
      }
      if (hasGlitch) {
        animStateUpdate.glitchOffset = glitchOffset;
        if (!hasNeon && isGlitchFrame) {
          animStateUpdate.glowPulse = Math.random() > 0.5 ? 1.0 : 0.2;
        }
      }
      if (hasTypewriter) {
        const totalChars = box.getTotalCharCount();
        let visibleChars = totalChars;
        if (cycleProgress < typingDuration) {
          const ratio = cycleProgress / typingDuration;
          visibleChars = Math.floor(totalChars * ratio);
        } else {
          visibleChars = totalChars;
        }
        animStateUpdate.typewriterChars = visibleChars;
      }

      box.setAnimationState(animStateUpdate);

      // Transform / geometry passes
      if (orig) {
        if (hasFloat) {
          box.y(orig.y + bob);
          box.scaleX(orig.scaleX * (1 + scaleDelta));
          box.scaleY(orig.scaleY * (1 + scaleDelta));
        }

        if (hasWave) {
          const doc = box.getDocument();
          if (doc.curve?.enabled) {
            box.setCurveAmount(orig.curve + wave);
          }
        }
      }
    }

    this.canvasManager.mainLayer.batchDraw();
  }

  // --- Video Backdrop Modes ---
  public setBackdropMode(mode: VideoBackdropMode) {
    this.backdropMode = mode;
    const stageContainer = this.canvasManager.stage.container();

    if (mode === "transparent") {
      this.canvasManager.bgRect.fill("rgba(0,0,0,0)");
      this.canvasManager.bgRect.shadowBlur(0);
      stageContainer.classList.add("checkerboard-backdrop");
    } else if (mode === "green") {
      this.canvasManager.bgRect.fill("#00FF00");
      this.canvasManager.bgRect.shadowBlur(0);
      stageContainer.classList.remove("checkerboard-backdrop");
    } else {
      this.canvasManager.bgRect.fill("#0B0E17");
      this.canvasManager.bgRect.shadowColor("rgba(0, 0, 0, 0.6)");
      this.canvasManager.bgRect.shadowBlur(32);
      stageContainer.classList.remove("checkerboard-backdrop");
    }

    this.canvasManager.backgroundLayer.batchDraw();
  }

  public getBackdropMode(): VideoBackdropMode {
    return this.backdropMode;
  }

  // --- Record & Export Video (.webm with alpha transparency) ---
  public async recordVideo(
    durationSeconds = 4,
    onProgress?: (percent: number) => void
  ): Promise<Blob> {
    // 1. Temporarily deselect so transformer handles are not recorded
    const selected = this.canvasManager.getSelected();
    this.canvasManager.selectNode(null);

    // 2. Ensure animation is playing
    const wasPlaying = this.isPlaying;
    if (!this.isPlaying) {
      if (this.activeEffects.size === 0 && !this.canvasManager.atmosphericFX.isAnyEffectActive()) {
        this.activeEffects.add("neon-pulse");
      }
      this.play();
    }

    // 3. Obtain canvas stream
    const stageEl = this.canvasManager.stage.container();
    const canvasEls = stageEl.querySelectorAll("canvas");
    const canvas = (canvasEls[canvasEls.length - 1] as HTMLCanvasElement) || canvasEls[0];

    if (!canvas || !canvas.captureStream) {
      throw new Error("HTML5 Canvas captureStream is not supported in this browser.");
    }

    const stream = canvas.captureStream(60);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";

    const recorder = new MediaRecorder(stream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: 8000000,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise<Blob>((resolve, reject) => {
      recorder.onerror = (e) => reject(e);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });

        // Restore prior state
        if (!wasPlaying) {
          this.pause();
        }
        if (selected) {
          this.canvasManager.selectNode(selected);
        }

        // Trigger automatic download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const effectNames = Array.from(this.activeEffects).join("-") || "layered";
        a.download = `esperanza-forge-motion-${effectNames}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve(blob);
      };

      recorder.start();

      // Progress reporting
      const startTime = performance.now();
      const interval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const pct = Math.min(100, Math.round((elapsed / durationSeconds) * 100));
        if (onProgress) onProgress(pct);

        if (elapsed >= durationSeconds) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 100);
    });
  }
}
