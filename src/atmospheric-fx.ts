import Konva from "konva";

export type AtmosphericEffectKey =
  | "sparkles"
  | "bokeh"
  | "hearts"
  | "rain"
  | "snow"
  | "dust"
  | "beams"
  | "hologram"
  | "crystals"
  | "crosshair"
  | "suns"
  | "vhs"
  | "scanlines"
  | "thermal"
  | "broadcast"
  | "vignette"
  | "cybergrid";

export interface AtmosphericEffectItemConfig {
  enabled: boolean;
  opacity: number;
  color?: string;
  speed?: number;
  density?: number;
  mode?: string;
  count?: number;
  text?: string;
  glitch?: number;
  [key: string]: any;
}

export function hexToRgba(hex: string, alpha = 1): string {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  if (hex.startsWith("rgba")) {
    return hex.replace(/[\d\.]+\)$/g, `${alpha})`);
  }
  if (hex.startsWith("rgb")) {
    return hex.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type AtmosphericEffectsConfig = Record<AtmosphericEffectKey, AtmosphericEffectItemConfig>;

export interface AtmosphericPreset {
  id: string;
  name: string;
  description: string;
  masterOpacity: number;
  blendMode: GlobalCompositeOperation;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
  };
  effects: Partial<Record<AtmosphericEffectKey, Partial<AtmosphericEffectItemConfig>>>;
}

interface SparkleParticle {
  x: number;
  y: number;
  size: number;
  rot: number;
  rotSpeed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  alpha: number;
}

interface BokehParticle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulseOffset: number;
  hueShift: number;
}

interface HeartParticle {
  x: number;
  y: number;
  size: number;
  vy: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  wobbleAmp: number;
  rot: number;
}

interface RainParticle {
  x: number;
  y: number;
  length: number;
  vy: number;
  vx: number;
  alpha: number;
}

interface SnowParticle {
  x: number;
  y: number;
  radius: number;
  vy: number;
  driftSpeed: number;
  driftOffset: number;
  alpha: number;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
}

export const ATMOSPHERIC_PRESETS: AtmosphericPreset[] = [
  {
    id: "golden_sparkles",
    name: "✨ Golden Sparkles",
    description: "Twinkling 4-point gold stars, soft depth-of-field bokeh, and feathered vignette.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      sparkles: { enabled: true, opacity: 0.85, color: "#ffdf00", density: 55 },
      bokeh: { enabled: true, opacity: 0.5, color: "#ffb6c1" },
      vignette: { enabled: true, opacity: 0.35 },
    },
  },
  {
    id: "staacor_sentinel",
    name: "⚡ Staacor Sentinel",
    description: "Cosmic dust, sweeping volumetric search beams, HoloNet broadcast framing, and CRT scanlines.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      dust: { enabled: true, opacity: 0.75, color: "#00f0ff" },
      beams: { enabled: true, opacity: 0.8, color: "#00f0ff" },
      broadcast: { enabled: true, opacity: 0.9, text: "STAACOR HOLONET // ARCHIVE" },
      scanlines: { enabled: true, opacity: 0.3, glitch: 0.04 },
    },
  },
  {
    id: "retro_vhs_1994",
    name: "📼 Retro VHS 1994",
    description: "90s camcorder OSD, flashing REC, live running timer, tracking jitter, and CRT scanlines.",
    masterOpacity: 1.0,
    blendMode: "source-over",
    effects: {
      vhs: { enabled: true, opacity: 0.95 },
      scanlines: { enabled: true, opacity: 0.6, glitch: 0.12 },
      vignette: { enabled: true, opacity: 0.5 },
    },
  },
  {
    id: "orbital_hologram",
    name: "🪐 Orbital Hologram",
    description: "Concentric rotating dashed orbit rings, mathematical telemetry formulas, and glowing nodes.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      hologram: { enabled: true, opacity: 0.85, color: "#00f0ff" },
      dust: { enabled: true, opacity: 0.65, color: "#00f0ff" },
      vignette: { enabled: true, opacity: 0.4 },
    },
  },
  {
    id: "bioluminescent_crystals",
    name: "💎 Bioluminescent Cavern",
    description: "Pulsing radiant energy nodes and defensive containment shields with cosmic motes.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      crystals: { enabled: true, opacity: 0.8 },
      dust: { enabled: true, opacity: 0.7, color: "#bf55ec" },
      vignette: { enabled: true, opacity: 0.45 },
    },
  },
  {
    id: "recon_drone_lock",
    name: "🎯 Drone Recon Crosshair",
    description: "Target tracking scanner reticles, density telemetry, and corner HUD brackets.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      crosshair: { enabled: true, opacity: 0.85, color: "#00ffa3" },
      scanlines: { enabled: true, opacity: 0.4, glitch: 0.05 },
      broadcast: { enabled: true, opacity: 0.75, text: "RECON DRONE 07 // TRACKING" },
    },
  },
  {
    id: "rainy_noir",
    name: "🌧️ Rainy Noir",
    description: "Cinematic slanted rainfall, floor impact ripples, CRT scanlines, and moody vignette.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      rain: { enabled: true, opacity: 0.85, speed: 1.3 },
      vignette: { enabled: true, opacity: 0.65 },
      scanlines: { enabled: true, opacity: 0.25, glitch: 0.02 },
    },
  },
  {
    id: "cyber_synthwave",
    name: "🌐 Cyber Synthwave Grid",
    description: "Glowing 3D perspective floor wireframe grid, twin celestial suns, and cosmic particles.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      cybergrid: { enabled: true, opacity: 0.75, color: "#ff007f" },
      suns: { enabled: true, opacity: 0.7 },
      dust: { enabled: true, opacity: 0.6, color: "#00f0ff" },
      scanlines: { enabled: true, opacity: 0.3, glitch: 0.04 },
    },
  },
  {
    id: "dreamy_hearts",
    name: "💖 Dreamy Hearts & Embers",
    description: "Floating romantic hearts drifting upward with gentle horizontal sway and pastel bokeh.",
    masterOpacity: 1.0,
    blendMode: "source-over",
    effects: {
      hearts: { enabled: true, opacity: 0.8, mode: "hearts" },
      bokeh: { enabled: true, opacity: 0.45, color: "#ff88bb" },
      vignette: { enabled: true, opacity: 0.3 },
    },
  },
  {
    id: "winter_snowfall",
    name: "❄️ Winter Snowfall",
    description: "Falling soft snowflakes drifting smoothly with atmospheric depth.",
    masterOpacity: 1.0,
    blendMode: "screen",
    effects: {
      snow: { enabled: true, opacity: 0.85 },
      vignette: { enabled: true, opacity: 0.4 },
    },
  },
  {
    id: "thermal_recon",
    name: "🌡️ Thermal Infrared Sensor",
    description: "False-color infrared thermal night vision simulation with tactical scanlines and telemetry.",
    masterOpacity: 1.0,
    blendMode: "source-over",
    effects: {
      thermal: { enabled: true, opacity: 0.75 },
      scanlines: { enabled: true, opacity: 0.4, glitch: 0.06 },
    },
  },
  {
    id: "clean_slate",
    name: "Clean Slate (No FX)",
    description: "Pure source typography and graphics without any active atmospheric effects.",
    masterOpacity: 1.0,
    blendMode: "source-over",
    effects: {},
  },
];

export class AtmosphericFXManager {
  private enabled = true;
  private masterOpacity = 1.0;
  private blendMode: GlobalCompositeOperation = "screen";
  private time = 0;
  private currentPresetId = "clean_slate";

  // Particle Pools
  private sparklesPool: SparkleParticle[] = [];
  private bokehPool: BokehParticle[] = [];
  private heartsPool: HeartParticle[] = [];
  private rainPool: RainParticle[] = [];
  private snowPool: SnowParticle[] = [];
  private dustPool: DustParticle[] = [];

  // Konva Shapes (integrated into mainLayer)
  private bgFXShape: Konva.Shape | null = null;
  private fgFXShape: Konva.Shape | null = null;

  // Effects Registry
  public effects: AtmosphericEffectsConfig = {
    sparkles: { enabled: false, opacity: 0.85, color: "#ffdf00", density: 45 },
    bokeh: { enabled: false, opacity: 0.55, color: "#ff66cc", count: 25 },
    hearts: { enabled: false, opacity: 0.75, color: "#ff5a8c", mode: "hearts", speed: 1.0 },
    rain: { enabled: false, opacity: 0.7, color: "#b4e1ff", speed: 1.2, count: 120 },
    snow: { enabled: false, opacity: 0.75, color: "#ffffff", count: 80 },
    dust: { enabled: false, opacity: 0.7, color: "#00f0ff", count: 70 },
    beams: { enabled: false, opacity: 0.8, color: "#00f0ff" },
    hologram: { enabled: false, opacity: 0.8, color: "#00f0ff" },
    crystals: { enabled: false, opacity: 0.75, color: "#00f0ff" },
    crosshair: { enabled: false, opacity: 0.85, color: "#00ffa3" },
    suns: { enabled: false, opacity: 0.8, color: "#ffb703" },
    vhs: { enabled: false, opacity: 0.9 },
    scanlines: { enabled: false, opacity: 0.45, glitch: 0.05 },
    thermal: { enabled: false, opacity: 0.65 },
    broadcast: { enabled: false, opacity: 0.85, color: "#00f0ff", text: "LIVE HOLONET FEED" },
    vignette: { enabled: false, opacity: 0.5 },
    cybergrid: { enabled: false, opacity: 0.65, color: "#ff007f" },
  };

  constructor() {
    this.initParticlePools();
  }

  private initParticlePools() {
    // 1. Sparkles Pool (70)
    this.sparklesPool = [];
    for (let i = 0; i < 70; i++) {
      this.sparklesPool.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 12 + 6,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        twinkleSpeed: Math.random() * 0.08 + 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    // 2. Bokeh Pool (40)
    this.bokehPool = [];
    for (let i = 0; i < 40; i++) {
      this.bokehPool.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 45 + 20,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006 - 0.0002,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        hueShift: Math.random() * 40 - 20,
      });
    }

    // 3. Hearts Pool (50)
    this.heartsPool = [];
    for (let i = 0; i < 50; i++) {
      this.heartsPool.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 16 + 8,
        vy: -(Math.random() * 0.0018 + 0.0008),
        wobbleSpeed: Math.random() * 0.06 + 0.02,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleAmp: Math.random() * 0.002 + 0.001,
        rot: (Math.random() - 0.5) * 0.4,
      });
    }

    // 4. Rain Pool (150)
    this.rainPool = [];
    for (let i = 0; i < 150; i++) {
      this.rainPool.push({
        x: Math.random() * 1.3 - 0.15,
        y: Math.random(),
        length: Math.random() * 25 + 15,
        vy: Math.random() * 0.025 + 0.02,
        vx: 0.003,
        alpha: Math.random() * 0.6 + 0.4,
      });
    }

    // 5. Snow Pool (100)
    this.snowPool = [];
    for (let i = 0; i < 100; i++) {
      this.snowPool.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 3.5 + 1.2,
        vy: Math.random() * 0.0015 + 0.0006,
        driftSpeed: Math.random() * 0.03 + 0.01,
        driftOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // 6. Dust Pool (80)
    this.dustPool = [];
    for (let i = 0; i < 80; i++) {
      this.dustPool.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008 - 0.0003,
        size: Math.random() * 2.8 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.05 + 0.02,
      });
    }
  }

  /**
   * Mount Konva Shapes into the mainLayer.
   * Background shape stays at bottom behind text/stickers.
   * Foreground shape stays on top for HUD / Scanlines / VHS.
   */
  public initNodes(mainLayer: Konva.Layer, width: number, height: number) {
    if (this.bgFXShape) this.bgFXShape.destroy();
    if (this.fgFXShape) this.fgFXShape.destroy();

    // Background Shape (Sparkles, Dust, Beams, Rain, Snow, Grid, etc.)
    this.bgFXShape = new Konva.Shape({
      name: "atmospheric-bg-fx",
      listening: false,
      sceneFunc: (context) => {
        if (!this.enabled || !this.isAnyBackgroundActive()) return;
        const ctx = context._context as CanvasRenderingContext2D;
        this.renderBackground(ctx, width, height);
      },
    });
    mainLayer.add(this.bgFXShape);
    this.bgFXShape.moveToBottom();

    // Foreground Shape (VHS, Scanlines, HUD, Thermal, Vignette, Crosshair)
    this.fgFXShape = new Konva.Shape({
      name: "atmospheric-fg-fx",
      listening: false,
      sceneFunc: (context) => {
        if (!this.enabled || !this.isAnyForegroundActive()) return;
        const ctx = context._context as CanvasRenderingContext2D;
        this.renderForeground(ctx, width, height);
      },
    });
    mainLayer.add(this.fgFXShape);
    // Foreground sits just below transformer
    this.fgFXShape.moveToTop();
  }

  public getBgShape(): Konva.Shape | null {
    return this.bgFXShape;
  }

  public getFgShape(): Konva.Shape | null {
    return this.fgFXShape;
  }

  public refreshZIndex(transformer?: Konva.Transformer) {
    if (this.bgFXShape) {
      this.bgFXShape.moveToBottom();
    }
    if (this.fgFXShape) {
      this.fgFXShape.moveToTop();
    }
    if (transformer) {
      transformer.moveToTop();
    }
  }

  public updateDimensions(width: number, height: number) {
    if (this.bgFXShape) {
      this.bgFXShape.size({ width, height });
    }
    if (this.fgFXShape) {
      this.fgFXShape.size({ width, height });
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public getMasterOpacity(): number {
    return this.masterOpacity;
  }

  public setMasterOpacity(val: number) {
    this.masterOpacity = Math.max(0, Math.min(1, val));
  }

  public getBlendMode(): GlobalCompositeOperation {
    return this.blendMode;
  }

  public setBlendMode(mode: GlobalCompositeOperation) {
    this.blendMode = mode;
  }

  public getCurrentPresetId(): string {
    return this.currentPresetId;
  }

  public isAnyEffectActive(): boolean {
    return Object.values(this.effects).some((e) => e.enabled);
  }

  public isAnyBackgroundActive(): boolean {
    const bgKeys: AtmosphericEffectKey[] = [
      "dust",
      "bokeh",
      "hearts",
      "snow",
      "rain",
      "sparkles",
      "beams",
      "hologram",
      "crystals",
      "suns",
      "cybergrid",
    ];
    return bgKeys.some((k) => this.effects[k]?.enabled);
  }

  public isAnyForegroundActive(): boolean {
    const fgKeys: AtmosphericEffectKey[] = [
      "crosshair",
      "thermal",
      "scanlines",
      "vhs",
      "broadcast",
      "vignette",
    ];
    return fgKeys.some((k) => this.effects[k]?.enabled);
  }

  public toggleEffect(key: AtmosphericEffectKey, forceState?: boolean): boolean {
    const eff = this.effects[key];
    if (!eff) return false;
    eff.enabled = forceState !== undefined ? forceState : !eff.enabled;
    this.currentPresetId = "custom";
    return eff.enabled;
  }

  public setEffectConfig(key: AtmosphericEffectKey, patch: Partial<AtmosphericEffectItemConfig>) {
    if (this.effects[key]) {
      this.effects[key] = { ...this.effects[key], ...patch };
      this.currentPresetId = "custom";
    }
  }

  /**
   * Apply a preset configuration from the catalog
   */
  public applyPreset(presetId: string): boolean {
    const preset = ATMOSPHERIC_PRESETS.find((p) => p.id === presetId);
    if (!preset) return false;

    // Reset all effects to disabled first
    for (const key of Object.keys(this.effects) as AtmosphericEffectKey[]) {
      this.effects[key].enabled = false;
    }

    this.masterOpacity = preset.masterOpacity ?? 1.0;
    this.blendMode = preset.blendMode ?? "screen";

    if (preset.effects) {
      for (const [key, val] of Object.entries(preset.effects)) {
        const k = key as AtmosphericEffectKey;
        if (this.effects[k] && val) {
          this.effects[k] = { ...this.effects[k], ...val };
        }
      }
    }

    this.currentPresetId = preset.id;
    return true;
  }

  /**
   * Advance particle positions and timing
   */
  public update(dtSeconds: number) {
    this.time += Math.min(dtSeconds, 0.1);
  }

  // =========================================================================
  // RENDER PIPELINES
  // =========================================================================

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const scale = Math.max(0.6, Math.min(w, h) / 540);

    ctx.save();
    ctx.globalCompositeOperation = this.blendMode || "screen";

    if (this.effects.dust.enabled) this.renderAtmosphericDust(ctx, w, h, scale, this.effects.dust);
    if (this.effects.bokeh.enabled) this.renderBokeh(ctx, w, h, scale, this.effects.bokeh);
    if (this.effects.hearts.enabled) this.renderHeartsEmbers(ctx, w, h, scale, this.effects.hearts);
    if (this.effects.snow.enabled) this.renderSnow(ctx, w, h, scale, this.effects.snow);
    if (this.effects.rain.enabled) this.renderRain(ctx, w, h, scale, this.effects.rain);
    if (this.effects.sparkles.enabled) this.renderSparkles(ctx, w, h, scale, this.effects.sparkles);

    // Sci-Fi / Spatial Layers
    if (this.effects.beams.enabled) this.renderSentinelBeams(ctx, w, h, scale, this.effects.beams);
    if (this.effects.hologram.enabled) this.renderHolographicRings(ctx, w, h, scale, this.effects.hologram);
    if (this.effects.crystals.enabled) this.renderCrystalShield(ctx, w, h, scale, this.effects.crystals);
    if (this.effects.suns.enabled) this.renderCelestialSuns(ctx, w, h, scale, this.effects.suns);
    if (this.effects.cybergrid.enabled) this.renderCyberGrid(ctx, w, h, scale, this.effects.cybergrid);

    ctx.restore();
  }

  private renderForeground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const scale = Math.max(0.6, Math.min(w, h) / 540);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    if (this.effects.crosshair.enabled) this.renderCrosshairHUD(ctx, w, h, scale, this.effects.crosshair);
    if (this.effects.thermal.enabled) this.renderThermalMode(ctx, w, h, scale, this.effects.thermal);
    if (this.effects.scanlines.enabled) this.renderScanlines(ctx, w, h, scale, this.effects.scanlines);
    if (this.effects.vhs.enabled) this.renderRetroVHS(ctx, w, h, scale, this.effects.vhs);
    if (this.effects.broadcast.enabled) this.renderBroadcastHUD(ctx, w, h, scale, this.effects.broadcast);
    if (this.effects.vignette.enabled) this.renderVignette(ctx, w, h, scale, this.effects.vignette);

    ctx.restore();
  }

  // =========================================================================
  // 17 PROCEDURAL CANVASES
  // =========================================================================

  // 1. ✨ Sparkles & Glitter (Mobile Glam)
  public renderSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#ffdf00";

    const count = Math.min(this.sparklesPool.length, conf.density || 45);
    for (let i = 0; i < count; i++) {
      const p = this.sparklesPool[i];
      p.rot += p.rotSpeed;
      const twinkle = Math.sin(this.time * 6 + p.twinkleOffset);
      if (twinkle < -0.2) continue;

      const px = p.x * w;
      const py = p.y * h;
      const size = p.size * (0.7 + twinkle * 0.3) * scale;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);

      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.5);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 4-Point Star Glint Rays
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(-size * 1.8, 0);
      ctx.lineTo(size * 1.8, 0);
      ctx.moveTo(0, -size * 1.8);
      ctx.lineTo(0, size * 1.8);
      ctx.stroke();

      // Diamond core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.4);
      ctx.lineTo(size * 0.4, 0);
      ctx.lineTo(0, size * 0.4);
      ctx.lineTo(-size * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // 2. 🔮 Soft Dreamy Bokeh Orbs
  public renderBokeh(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const baseColor = conf.color || "#ff88cc";

    for (const p of this.bokehPool) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -0.1) p.x = 1.1;
      if (p.x > 1.1) p.x = -0.1;
      if (p.y < -0.1) p.y = 1.1;
      if (p.y > 1.1) p.y = -0.1;

      const px = p.x * w;
      const py = p.y * h;
      const pulse = 0.8 + Math.sin(this.time * 2 + p.pulseOffset) * 0.2;
      const rad = p.radius * pulse * scale;

      const grad = ctx.createRadialGradient(px, py, rad * 0.1, px, py, rad);
      grad.addColorStop(0, baseColor);
      grad.addColorStop(0.7, hexToRgba(baseColor, 0.27));
      grad.addColorStop(1, hexToRgba(baseColor, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(baseColor, 0.53);
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(px, py, rad * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. 💖 Floating Hearts & Embers
  public renderHeartsEmbers(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const isEmbers = conf.mode === "embers";
    const color = conf.color || (isEmbers ? "#ff9900" : "#ff5a8c");

    for (const p of this.heartsPool) {
      p.y += p.vy * (conf.speed || 1.0);
      p.x += Math.sin(this.time * 4 + p.wobbleOffset) * p.wobbleAmp;

      if (p.y < -0.1) {
        p.y = 1.05;
        p.x = Math.random();
      }

      const px = p.x * w;
      const py = p.y * h;
      const s = p.size * scale;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);

      if (isEmbers) {
        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, s);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = hexToRgba(color, 0.85);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.2, 0, s * 0.9);
        ctx.bezierCurveTo(s, s * 0.2, s * 0.5, -s * 0.3, 0, s * 0.3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // 4. 🌧️ Atmospheric Rainfall & Splashes
  public renderRain(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#b4e1ff";
    ctx.strokeStyle = hexToRgba(color, 0.65);
    ctx.lineWidth = 1.2 * scale;

    const speed = conf.speed || 1.2;
    for (const p of this.rainPool) {
      p.y += p.vy * speed;
      p.x += p.vx * speed;

      if (p.y > 1.0) {
        p.y = -0.05;
        p.x = Math.random() * 1.3 - 0.15;
      }

      const px = p.x * w;
      const py = p.y * h;
      const len = p.length * scale;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + len * 0.15, py + len);
      ctx.stroke();

      if (p.y > 0.92) {
        ctx.strokeStyle = hexToRgba(color, 0.3);
        ctx.beginPath();
        ctx.ellipse(px, h * 0.98, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 5. ❄️ Atmospheric Snow
  public renderSnow(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = conf.color || "#ffffff";

    for (const p of this.snowPool) {
      p.y += p.vy;
      p.x += Math.sin(this.time * 2 + p.driftOffset) * 0.0006;

      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }

      const px = p.x * w;
      const py = p.y * h;
      const rad = p.radius * scale;

      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. 🌌 Cosmic Dust & Ambient Motes
  public renderAtmosphericDust(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00f0ff";

    for (const p of this.dustPool) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;

      const px = p.x * w;
      const py = p.y * h;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 7. 🔦 Volumetric Search Beams & Flares
  public renderSentinelBeams(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00f0ff";
    const cx = w * 0.5;
    const cy = h * 0.32;

    const eyeShiftX = Math.sin(this.time * 0.8) * (8 * scale);
    const eyeShiftY = Math.cos(this.time * 0.5) * (4 * scale);
    const eyeIntensity = 0.8 + Math.sin(this.time * 2) * 0.2;

    const leftEye = { x: cx - 22 * scale + eyeShiftX * 0.5, y: cy - 20 * scale + eyeShiftY * 0.5 };
    const rightEye = { x: cx + 22 * scale + eyeShiftX * 0.5, y: cy - 20 * scale + eyeShiftY * 0.5 };

    [leftEye, rightEye].forEach((eye) => {
      const grad = ctx.createRadialGradient(eye.x, eye.y, 1, eye.x, eye.y, 50 * scale);
      grad.addColorStop(0, hexToRgba(color, 0.9 * eyeIntensity));
      grad.addColorStop(0.3, hexToRgba("#ffb703", 0.6 * eyeIntensity));
      grad.addColorStop(1, hexToRgba(color, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 50 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    const sweepAngle = Math.sin(this.time * 0.6) * 0.45;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweepAngle);

    const beamGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    beamGrad.addColorStop(0, hexToRgba(color, 0.45));
    beamGrad.addColorStop(0.5, hexToRgba(color, 0.15));
    beamGrad.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-18 * scale, 0);
    ctx.lineTo(18 * scale, 0);
    ctx.lineTo(120 * scale, h * 0.75);
    ctx.lineTo(-120 * scale, h * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const pulseRadius = (30 + ((this.time * 30) % 140)) * scale;
    const pulseAlpha = Math.max(0, 1 - pulseRadius / (140 * scale));
    ctx.strokeStyle = `rgba(255, 183, 3, ${pulseAlpha * 0.75})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy + 50 * scale, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // 8. 🪐 Holographic 3D Orbit Rings & Glyphs
  public renderHolographicRings(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00f0ff";
    const cx = w * 0.7;
    const cy = h * 0.38;

    ctx.save();
    ctx.translate(cx, cy);

    for (let r = 1; r <= 3; r++) {
      const radiusX = r * 42 * scale;
      const radiusY = r * 18 * scale;
      const rot = this.time * 0.5 * (r % 2 === 0 ? -1 : 1);

      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = hexToRgba(color, 0.45 / r + Math.sin(this.time * 3) * 0.15);
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([5 * scale, 5 * scale]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      const px = Math.cos(this.time * (1.2 / r)) * radiusX;
      const py = Math.sin(this.time * (1.2 / r)) * radiusY;
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(px, py, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.setLineDash([]);
    const fontSize = Math.max(10, Math.round(11 * scale));
    ctx.font = `${fontSize}px "Space Grotesk", monospace`;
    ctx.fillStyle = hexToRgba(color, 0.85);
    const equations = [
      `∇ × B = μ₀J + μ₀ε₀(∂E/∂t)`,
      `Ψ(r,t) = Ae^(i(k·r - ωt))`,
      `Quantum Coherence: 99.98%`,
    ];

    equations.forEach((eq, idx) => {
      const yOffset = (-70 + idx * 18 + Math.sin(this.time + idx) * 3) * scale;
      ctx.fillText(eq, -130 * scale, yOffset);
    });

    ctx.restore();
    ctx.restore();
  }

  // 9. 💎 Bioluminescent Crystals & Shield
  public renderCrystalShield(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00f0ff";

    const nodes = [
      { x: w * 0.2, y: h * 0.65, size: 75 * scale, color: color },
      { x: w * 0.78, y: h * 0.72, size: 90 * scale, color: "#bf55ec" },
      { x: w * 0.5, y: h * 0.22, size: 65 * scale, color: "#00ffa3" },
    ];

    nodes.forEach((node) => {
      const pulse = 0.5 + Math.sin(this.time * 2.5 + node.x) * 0.35;
      const grad = ctx.createRadialGradient(node.x, node.y, 5 * scale, node.x, node.y, node.size);
      grad.addColorStop(0, hexToRgba(node.color, 0.8 * pulse));
      grad.addColorStop(0.7, hexToRgba(node.color, 0.2 * pulse));
      grad.addColorStop(1, hexToRgba(node.color, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(node.color, 0.6 * pulse);
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.restore();
  }

  // 10. 🎯 Reconnaissance Drone Crosshair & Telemetry
  public renderCrosshairHUD(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00ffa3";

    const droneX = w * (0.35 + Math.sin(this.time * 0.5) * 0.2);
    const droneY = h * 0.42;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);

    ctx.beginPath();
    ctx.moveTo(droneX - 45 * scale, droneY);
    ctx.lineTo(droneX + 45 * scale, droneY);
    ctx.moveTo(droneX, droneY - 45 * scale);
    ctx.lineTo(droneX, droneY + 45 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(droneX, droneY, 32 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const fontSize = Math.max(9, Math.round(10 * scale));
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = color;
    ctx.fillText(`TARGET LOCKED // DENSITY 98.4%`, droneX + 50 * scale, droneY - 12 * scale);
    ctx.fillText(`COORDINATES: [${droneX.toFixed(0)}, ${droneY.toFixed(0)}]`, droneX + 50 * scale, droneY + 8 * scale);

    ctx.restore();
  }

  // 11. ☀️ Twin Celestial Suns & Satellite Strike
  public renderCelestialSuns(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#ffb703";

    const sun1 = { x: w * 0.18, y: h * 0.18, r: 35 * scale };
    const sun2 = { x: w * 0.28, y: h * 0.13, r: 26 * scale };

    [sun1, sun2].forEach((sun) => {
      const pulse = 1 + Math.sin(this.time * 3 + sun.x) * 0.1;
      const grad = ctx.createRadialGradient(sun.x, sun.y, 4 * scale, sun.x, sun.y, sun.r * 2.5 * pulse);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, color);
      grad.addColorStop(0.7, hexToRgba(color, 0.4));
      grad.addColorStop(1, hexToRgba(color, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.r * 2.5 * pulse, 0, Math.PI * 2);
      ctx.fill();
    });

    const satX = w * 0.35;
    const satY = h * 0.55;
    const targetX = w * 0.65;
    const targetY = h * 0.72;

    const beamAlpha = 0.5 + Math.sin(this.time * 5) * 0.3;
    ctx.strokeStyle = hexToRgba(color, beamAlpha);
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.restore();
  }

  // 12. 📼 Retro VHS Camcorder 1994 OSD
  public renderRetroVHS(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;

    const isBlink = Math.sin(this.time * 3) > 0;
    ctx.fillStyle = isBlink ? "#ff3344" : "transparent";
    ctx.beginPath();
    ctx.arc(38 * scale, 42 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    const fontSize = Math.max(11, Math.round(13 * scale));
    ctx.font = `700 ${fontSize}px monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("REC", 52 * scale, 46 * scale);

    ctx.font = `600 ${Math.max(10, Math.round(12 * scale))}px monospace`;
    ctx.fillText("SP  [|||| ]", w - 120 * scale, 46 * scale);

    const dateStr = `SEP 08 1994`;
    const sec = Math.floor(this.time) % 60;
    const min = Math.floor(this.time / 60) % 60;
    const hour = 12;
    const timeStr = `PM ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    ctx.font = `700 ${Math.max(12, Math.round(14 * scale))}px monospace`;
    ctx.fillStyle = "#ffeb3b";
    ctx.fillText(dateStr, 34 * scale, h - 50 * scale);
    ctx.fillText(timeStr, 34 * scale, h - 30 * scale);

    if (Math.random() < 0.2) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      const jitterY = (this.time * 120) % h;
      ctx.fillRect(0, jitterY, w, 12 * scale);
    }

    ctx.restore();
  }

  // 13. 📺 CRT Scanlines & Slice Glitch
  public renderScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    const lineStep = Math.max(3, Math.round(4 * scale));
    for (let y = 0; y < h; y += lineStep) {
      ctx.fillRect(0, y, w, 1.8 * scale);
    }

    if (Math.random() < (conf.glitch || 0.05)) {
      const glitchY = Math.random() * h;
      const glitchH = (Math.random() * 12 + 4) * scale;
      ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
      ctx.fillRect(0, glitchY, w, glitchH);

      ctx.fillStyle = "rgba(255, 0, 100, 0.2)";
      ctx.fillRect(0, glitchY + 2, w, glitchH * 0.7);
    }
    ctx.restore();
  }

  // 14. 🌡️ Thermal / Night Vision Sensor Mode
  public renderThermalMode(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.fillStyle = "rgba(255, 40, 0, 0.12)";
    ctx.fillRect(0, 0, w, h);

    const fontSize = Math.max(9, Math.round(11 * scale));
    ctx.font = `700 ${fontSize}px monospace`;
    ctx.fillStyle = "#ff3366";
    ctx.fillText("THERMAL SENSOR ACTIVE // SPECTRUM: INFRARED", 34 * scale, h - 34 * scale);

    ctx.restore();
  }

  // 15. 📡 Live Broadcast HUD & Tactical Brackets
  public renderBroadcastHUD(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#00f0ff";

    const livePulse = Math.sin(this.time * 4) > 0;
    ctx.fillStyle = livePulse ? "#ff3366" : "rgba(255, 51, 102, 0.4)";
    ctx.beginPath();
    ctx.arc(32 * scale, 32 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    const fontSize = Math.max(10, Math.round(12 * scale));
    ctx.font = `700 ${fontSize}px monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("LIVE HOLONET FEED", 46 * scale, 36 * scale);

    const text = conf.text || "STAACOR HOLONET // ARCHIVE";
    ctx.font = `700 ${Math.max(9, Math.round(11 * scale))}px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = "right";
    ctx.fillText(text, w - 30 * scale, 36 * scale);
    ctx.textAlign = "left";

    ctx.strokeStyle = hexToRgba(color, 0.5);
    ctx.lineWidth = 1.5 * scale;
    const margin = 24 * scale;
    const len = 28 * scale;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(margin, margin + len);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + len, margin);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(w - margin - len, margin);
    ctx.lineTo(w - margin, margin);
    ctx.lineTo(w - margin, margin + len);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(margin, h - margin - len);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(margin + len, h - margin);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(w - margin - len, h - margin);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin, h - margin - len);
    ctx.stroke();

    ctx.restore();
  }

  // 16. 🎬 Cinematic Vignette
  public renderVignette(ctx: CanvasRenderingContext2D, w: number, h: number, _scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;

    const maxRad = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
    const grad = ctx.createRadialGradient(w / 2, h / 2, maxRad * 0.4, w / 2, h / 2, maxRad);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(0.7, "rgba(0, 0, 0, 0.4)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 17. 🌐 3D Perspective Cyber Synthwave Grid
  public renderCyberGrid(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, conf: AtmosphericEffectItemConfig) {
    const opacity = conf.opacity * this.masterOpacity;
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    const color = conf.color || "#ff007f";
    const horizon = h * 0.65;
    const vpX = w * 0.5;
    const vpY = horizon;

    // Horizon aura glow reacting to custom color
    const auraGrad = ctx.createRadialGradient(vpX, vpY, 4 * scale, vpX, vpY, w * 0.5);
    auraGrad.addColorStop(0, hexToRgba(color, 0.35));
    auraGrad.addColorStop(0.5, hexToRgba(color, 0.1));
    auraGrad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, horizon - 15 * scale, w, h - horizon + 15 * scale);

    // Grid lines with neon glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3 * scale;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6 * scale;

    const count = 16;
    for (let i = -count; i <= count; i++) {
      const bottomX = vpX + i * (w / count) * 1.5;
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    const speed = (this.time * 40) % 30;
    for (let y = 0; y <= h - horizon; y += 15 * scale) {
      const curveY = horizon + Math.pow(y / (h - horizon), 1.8) * (h - horizon) + speed * (y / (h - horizon));
      if (curveY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, curveY);
        ctx.lineTo(w, curveY);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // =========================================================================
  // SERIALIZATION (Save / Load with Project JSON)
  // =========================================================================

  public exportState() {
    return {
      enabled: this.enabled,
      masterOpacity: this.masterOpacity,
      blendMode: this.blendMode,
      currentPresetId: this.currentPresetId,
      effects: JSON.parse(JSON.stringify(this.effects)),
    };
  }

  public importState(data: any) {
    if (!data) return;
    if (data.enabled !== undefined) this.enabled = !!data.enabled;
    if (data.masterOpacity !== undefined) this.masterOpacity = data.masterOpacity;
    if (data.blendMode) this.blendMode = data.blendMode;
    if (data.currentPresetId) this.currentPresetId = data.currentPresetId;
    if (data.effects) {
      for (const [key, val] of Object.entries(data.effects)) {
        const k = key as AtmosphericEffectKey;
        if (this.effects[k] && typeof val === "object") {
          this.effects[k] = { ...this.effects[k], ...val };
        }
      }
    }
  }
}
