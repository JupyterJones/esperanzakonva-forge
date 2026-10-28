import { ForgeImageNode, ForgeImageFrame, ForgeImageConfig } from "./forge-image-node";

export async function decodeGifFrames(blob: Blob): Promise<ForgeImageFrame[]> {
  if (typeof (window as any).ImageDecoder === "undefined") {
    return [];
  }
  try {
    const buffer = await blob.arrayBuffer();
    const decoder = new (window as any).ImageDecoder({ data: buffer, type: "image/gif" });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    const frameCount = track.frameCount;
    const frames: ForgeImageFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      const videoFrame = result.image;
      const canvas = document.createElement("canvas");
      canvas.width = videoFrame.displayWidth || videoFrame.codedWidth;
      canvas.height = videoFrame.displayHeight || videoFrame.codedHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoFrame, 0, 0);
      const delay = (result.duration || 100000) / 1000; // microseconds to milliseconds
      videoFrame.close();
      frames.push({ canvas, delay: Math.max(20, delay) });
    }
    return frames;
  } catch (err) {
    console.warn("ImageDecoder failed, will fallback to static:", err);
    return [];
  }
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function createForgeVideoFromFile(
  file: File,
  options?: Partial<ForgeImageConfig>
): Promise<ForgeImageNode> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const onLoaded = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 360;
      const { w, h } = calculateInitialSize(vw, vh);

      const node = new ForgeImageNode(
        {
          x: options?.x,
          y: options?.y,
          width: w,
          height: h,
          src: objectUrl,
          isAnimated: true,
          isVideo: true,
          ...options,
        },
        video
      );
      video.play().catch((err) => console.warn("Video playback autoplay note:", err));
      resolve(node);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.onerror = (err) => {
      reject(new Error("Unable to decode MP4 / WebM video overlay: " + String(err)));
    };
  });
}

export async function createForgeImageFromFile(
  file: File,
  options?: Partial<ForgeImageConfig>
): Promise<ForgeImageNode> {
  const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  if (isVideo) {
    return createForgeVideoFromFile(file, options);
  }

  const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");

  if (isGif) {
    const decodedFrames = await decodeGifFrames(file);
    if (decodedFrames.length > 1) {
      const firstCanvas = decodedFrames[0].canvas;
      const { w, h } = calculateInitialSize(firstCanvas.width, firstCanvas.height);
      const node = new ForgeImageNode(
        {
          x: options?.x,
          y: options?.y,
          width: w,
          height: h,
          src: URL.createObjectURL(file),
          frames: decodedFrames,
          isAnimated: true,
          ...options,
        },
        firstCanvas
      );
      return node;
    }
  }

  // Static PNG / WebP / SVG or single-frame fallback
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImageElement(dataUrl);
  const { w, h } = calculateInitialSize(img.naturalWidth || 300, img.naturalHeight || 300);

  const node = new ForgeImageNode(
    {
      x: options?.x,
      y: options?.y,
      width: w,
      height: h,
      src: dataUrl,
      isAnimated: false,
      ...options,
    },
    img
  );
  return node;
}

export async function createForgeImageFromDataUrl(
  dataUrl: string,
  options?: Partial<ForgeImageConfig>
): Promise<ForgeImageNode> {
  const img = await loadImageElement(dataUrl);
  const { w, h } = calculateInitialSize(img.naturalWidth || 300, img.naturalHeight || 300);

  const node = new ForgeImageNode(
    {
      x: options?.x,
      y: options?.y,
      width: w,
      height: h,
      src: dataUrl,
      isAnimated: false,
      ...options,
    },
    img
  );
  return node;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function calculateInitialSize(naturalW: number, naturalH: number, maxDim = 320): { w: number; h: number } {
  let w = naturalW;
  let h = naturalH;
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }
  return { w: Math.max(40, w), h: Math.max(40, h) };
}

// --- BUILT-IN ANIMATED STICKER GENERATORS ---

export function createAnimatedRecBadge(): ForgeImageFrame[] {
  const frames: ForgeImageFrame[] = [];
  const totalFrames = 16;
  const w = 260;
  const h = 64;

  for (let i = 0; i < totalFrames; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    const progress = i / totalFrames;
    const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2);

    // Pill glass background
    ctx.fillStyle = "rgba(10, 15, 26, 0.88)";
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.6 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, w - 8, h - 8, 14);
    ctx.fill();
    ctx.stroke();

    // Red pulsing REC dot with outer glow
    ctx.shadowColor = "#EF4444";
    ctx.shadowBlur = 12 + pulse * 16;
    ctx.fillStyle = `rgba(239, 68, 68, ${0.7 + 0.3 * pulse})`;
    ctx.beginPath();
    ctx.arc(30, h / 2, 8 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // "REC" text
    ctx.font = "bold 18px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("REC", 48, h / 2 + 6);

    // Audio level animated equalizer bars
    const barCount = 6;
    for (let b = 0; b < barCount; b++) {
      const barHeight = 8 + 20 * Math.abs(Math.sin(progress * 4 + b * 0.8));
      const barX = 104 + b * 10;
      const barY = h / 2 + 9 - barHeight;
      ctx.fillStyle = b > 4 ? "#EF4444" : b > 2 ? "#F59E0B" : "#10B981";
      ctx.beginPath();
      ctx.roundRect(barX, barY, 5, barHeight, 2);
      ctx.fill();
    }

    // Timecode
    ctx.font = "600 12px monospace";
    ctx.fillStyle = "#94A3B8";
    const sec = String(Math.floor(progress * 10)).padStart(2, "0");
    ctx.fillText(`00:0${sec}`, 180, h / 2 + 5);

    frames.push({ canvas, delay: 65 });
  }
  return frames;
}

export function createAnimatedCyberRing(): ForgeImageFrame[] {
  const frames: ForgeImageFrame[] = [];
  const totalFrames = 24;
  const size = 180;
  const center = size / 2;

  for (let i = 0; i < totalFrames; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const angle = (i / totalFrames) * Math.PI * 2;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    // Outer glow
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 2.5;

    // Segmented outer ring
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 68, Math.PI * 0.8, Math.PI * 1.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 68, Math.PI * 1.6, Math.PI * 1.95);
    ctx.stroke();

    // Inner counter-rotating ring
    ctx.rotate(-angle * 2);
    ctx.strokeStyle = "#FF007F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 1.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 46, Math.PI * 1.4, Math.PI * 1.8);
    ctx.stroke();

    // Center crosshair
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    ctx.restore();
    frames.push({ canvas, delay: 50 });
  }
  return frames;
}

// --- BUILT-IN TRANSPARENT PNG STICKERS (Client-side Vector Rendered) ---

export function createTransparentLiveBadge(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 180;
  canvas.height = 56;
  const ctx = canvas.getContext("2d")!;

  // Glass pill
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(3, 3, 174, 50, 14);
  ctx.fill();
  ctx.stroke();

  // Red glow dot
  ctx.shadowColor = "#EF4444";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.arc(26, 28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // "LIVE" text
  ctx.font = "bold 22px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("LIVE", 44, 35);

  // Broadcast waves icon
  ctx.strokeStyle = "#EF4444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(142, 28, 8, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(142, 28, 14, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

export function createTransparentSubscribeButton(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Red gradient button
  const grad = ctx.createLinearGradient(0, 0, 240, 0);
  grad.addColorStop(0, "#DC2626");
  grad.addColorStop(1, "#991B1B");

  ctx.shadowColor = "rgba(220, 38, 38, 0.6)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(4, 4, 232, 56, 14);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Play triangle
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(28, 22);
  ctx.lineTo(44, 32);
  ctx.lineTo(28, 42);
  ctx.closePath();
  ctx.fill();

  // "SUBSCRIBE" text
  ctx.font = "bold 18px 'Montserrat', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("SUBSCRIBE", 58, 38);

  return canvas.toDataURL("image/png");
}

export function createTransparent4kSeal(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 170;
  canvas.height = 54;
  const ctx = canvas.getContext("2d")!;

  // Gold gradient pill
  const grad = ctx.createLinearGradient(0, 0, 170, 0);
  grad.addColorStop(0, "#F59E0B");
  grad.addColorStop(0.5, "#FDE68A");
  grad.addColorStop(1, "#D97706");

  ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(4, 4, 162, 46, 12);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  // "4K ULTRA HD"
  ctx.font = "bold 16px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#FDE68A";
  ctx.fillText("★ 4K ULTRA HD ★", 14, 33);

  return canvas.toDataURL("image/png");
}

export function createTransparentVerifiedBadge(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 54;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
  ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(4, 4, 152, 46, 12);
  ctx.fill();
  ctx.stroke();

  // Green check circle
  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.arc(26, 27, 12, 0, Math.PI * 2);
  ctx.fill();

  // Checkmark
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(20, 27);
  ctx.lineTo(24, 31);
  ctx.lineTo(32, 22);
  ctx.stroke();

  // Text
  ctx.font = "bold 15px 'Inter', sans-serif";
  ctx.fillStyle = "#A7F3D0";
  ctx.fillText("VERIFIED", 48, 32);

  return canvas.toDataURL("image/png");
}
