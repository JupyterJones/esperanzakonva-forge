import Konva from "konva";

export interface ForgeImageFrame {
  canvas: HTMLCanvasElement;
  delay: number; // in milliseconds
}

export interface ForgeImageConfig {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  src: string;
  name?: string;
  id?: string;
  draggable?: boolean;
  frames?: ForgeImageFrame[];
  isAnimated?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
}

export class ForgeImageNode extends Konva.Group {
  public konvaImage: Konva.Image;
  public src: string;
  public isAnimated: boolean = false;
  public frames: ForgeImageFrame[] = [];
  public currentFrameIndex: number = 0;
  public isPlaying: boolean = true;
  private animTimer: number | null = null;
  private isDestroyed: boolean = false;

  constructor(config: ForgeImageConfig, initialElement: CanvasImageSource) {
    const w = config.width ?? 200;
    const h = config.height ?? 200;

    super({
      x: config.x ?? 100,
      y: config.y ?? 100,
      width: w,
      height: h,
      rotation: config.rotation ?? 0,
      scaleX: config.scaleX ?? 1,
      scaleY: config.scaleY ?? 1,
      opacity: config.opacity ?? 1,
      draggable: config.draggable ?? true,
      name: "forge-image",
      id: config.id ?? `forge-img-${Date.now()}`,
    });

    this.src = config.src;
    this.isAnimated = config.isAnimated ?? (config.frames ? config.frames.length > 1 : false);
    this.frames = config.frames ?? [];

    this.konvaImage = new Konva.Image({
      image: initialElement,
      width: w,
      height: h,
      shadowColor: config.shadowColor,
      shadowBlur: config.shadowBlur ?? 0,
      shadowOpacity: config.shadowColor ? 0.8 : 0,
    });

    this.add(this.konvaImage);

    // Hit bounding box & cursor hovering
    this.on("mouseenter", () => {
      const stage = this.getStage();
      if (stage) stage.container().style.cursor = "move";
    });

    this.on("mouseleave", () => {
      const stage = this.getStage();
      if (stage) stage.container().style.cursor = "default";
    });

    if (this.isAnimated && this.frames.length > 1) {
      this.startAnimationLoop();
    }
  }

  public setFrames(frames: ForgeImageFrame[]) {
    this.frames = frames;
    this.isAnimated = frames.length > 1;
    this.currentFrameIndex = 0;
    if (this.isAnimated) {
      this.startAnimationLoop();
    }
  }

  private startAnimationLoop() {
    this.stopAnimationLoop();
    if (this.isDestroyed || this.frames.length <= 1) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (this.isDestroyed) return;
      if (this.isPlaying && this.frames.length > 1) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const delay = Math.max(20, currentFrame?.delay ?? 100);

        if (now - lastTime >= delay) {
          lastTime = now;
          this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
          const nextFrame = this.frames[this.currentFrameIndex];
          if (nextFrame) {
            this.konvaImage.image(nextFrame.canvas);
            const layer = this.getLayer();
            if (layer) layer.batchDraw();
          }
        }
      }
      this.animTimer = requestAnimationFrame(loop);
    };

    this.animTimer = requestAnimationFrame(loop);
  }

  public stopAnimationLoop() {
    if (this.animTimer !== null) {
      cancelAnimationFrame(this.animTimer);
      this.animTimer = null;
    }
  }

  public togglePlayPause(): boolean {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  public setGraphicOpacity(val: number) {
    this.opacity(Math.max(0, Math.min(1, val)));
    this.getLayer()?.batchDraw();
  }

  public setGlow(color: string, blur: number) {
    this.konvaImage.shadowColor(color);
    this.konvaImage.shadowBlur(blur);
    this.konvaImage.shadowOpacity(blur > 0 ? 0.85 : 0);
    this.getLayer()?.batchDraw();
  }

  public toJSONData() {
    return {
      type: "image",
      x: this.x(),
      y: this.y(),
      width: this.width(),
      height: this.height(),
      scaleX: this.scaleX(),
      scaleY: this.scaleY(),
      rotation: this.rotation(),
      opacity: this.opacity(),
      src: this.src,
      isAnimated: this.isAnimated,
      shadowColor: this.konvaImage.shadowColor(),
      shadowBlur: this.konvaImage.shadowBlur(),
    };
  }

  public destroy(): this {
    this.isDestroyed = true;
    this.stopAnimationLoop();
    return super.destroy();
  }
}
