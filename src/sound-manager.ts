export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  filename?: string;
  isCustom?: boolean;
}

export class SoundManager {
  private audioElement: HTMLAudioElement;
  private currentTrack: AudioTrack | null = null;
  private playlist: AudioTrack[] = [];
  private isLooping: boolean = true;
  private isPlaying: boolean = false;

  // Listeners
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onTrackChange?: (track: AudioTrack) => void;
  public onPlaylistUpdate?: (playlist: AudioTrack[]) => void;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.loop = this.isLooping;
    this.audioElement.volume = 0.8;

    this.audioElement.addEventListener("play", () => {
      this.isPlaying = true;
      this.onPlayStateChange?.(true);
    });

    this.audioElement.addEventListener("pause", () => {
      this.isPlaying = false;
      this.onPlayStateChange?.(false);
    });

    this.audioElement.addEventListener("timeupdate", () => {
      this.onTimeUpdate?.(this.audioElement.currentTime, this.audioElement.duration || 0);
    });

    this.audioElement.addEventListener("ended", () => {
      if (!this.isLooping) {
        this.nextTrack();
      }
    });

    // Dynamically discover all MP3s in /public/mp3
    this.discoverMp3Files();
  }

  public async discoverMp3Files(): Promise<AudioTrack[]> {
    const electronApi = (window as any).electronAPI;
    let discovered: AudioTrack[] = [];

    // 1. If running inside Electron, scan directory via IPC
    if (electronApi && electronApi.listMp3Files) {
      try {
        const files: Array<{ id: string; filename: string; title: string; artist: string; url: string }> =
          await electronApi.listMp3Files();
        if (files && files.length > 0) {
          discovered = files.map((f) => ({
            id: f.id,
            title: f.title,
            artist: f.artist || "Soundtrack",
            url: f.url,
            filename: f.filename,
          }));
        }
      } catch (err) {
        console.warn("Electron listMp3Files IPC warning:", err);
      }
    }

    // 2. If no files discovered via Electron, fetch from Vite dev server /api/mp3-list
    if (discovered.length === 0) {
      try {
        const res = await fetch("/api/mp3-list");
        if (res.ok) {
          const fileNames: string[] = await res.json();
          discovered = fileNames.map((fn) => ({
            id: fn,
            title: fn.replace(/\.mp3$/i, "").replace(/[-_]/g, " "),
            artist: "Soundtrack",
            url: `./mp3/${encodeURIComponent(fn)}`,
            filename: fn,
          }));
        }
      } catch (_) {}
    }

    // 3. If still empty, check ./mp3/manifest.json (generated at build time)
    if (discovered.length === 0) {
      try {
        const res = await fetch("./mp3/manifest.json");
        if (res.ok) {
          const fileNames: string[] = await res.json();
          discovered = fileNames.map((fn) => ({
            id: fn,
            title: fn.replace(/\.mp3$/i, "").replace(/[-_]/g, " "),
            artist: "Soundtrack",
            url: `./mp3/${encodeURIComponent(fn)}`,
            filename: fn,
          }));
        }
      } catch (_) {}
    }

    // Keep any user-added custom tracks at the top
    const customTracks = this.playlist.filter((t) => t.isCustom);
    this.playlist = [...customTracks, ...discovered];

    if (this.playlist.length > 0 && !this.currentTrack) {
      this.selectTrack(this.playlist[0], false);
    }

    this.onPlaylistUpdate?.(this.playlist);
    return this.playlist;
  }

  public openMp3Folder() {
    const electronApi = (window as any).electronAPI;
    if (electronApi && electronApi.openMp3Folder) {
      electronApi.openMp3Folder();
    }
  }

  public getPlaylist(): AudioTrack[] {
    return this.playlist;
  }

  public getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  public selectTrack(track: AudioTrack, autoPlay = true) {
    this.currentTrack = track;
    this.audioElement.src = track.url;
    this.audioElement.load();
    this.onTrackChange?.(track);

    if (autoPlay) {
      this.play();
    }
  }

  public selectTrackById(id: string, autoPlay = true) {
    const track = this.playlist.find((t) => t.id === id);
    if (track) {
      this.selectTrack(track, autoPlay);
    }
  }

  public async loadCustomAudioFile(file: File) {
    const url = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const customTrack: AudioTrack = {
      id: `custom-${Date.now()}`,
      title: cleanTitle,
      artist: "Local MP3",
      url,
      filename: file.name,
      isCustom: true,
    };

    this.playlist.unshift(customTrack);
    this.onPlaylistUpdate?.(this.playlist);
    this.selectTrack(customTrack, true);
    return customTrack;
  }

  public play() {
    if (!this.audioElement.src && this.playlist.length > 0) {
      this.selectTrack(this.playlist[0], true);
      return;
    }
    this.audioElement.play().catch((err) => {
      console.warn("Audio play blocked by browser policy:", err);
    });
  }

  public pause() {
    this.audioElement.pause();
  }

  public togglePlayPause(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
    this.onPlayStateChange?.(false);
  }

  public nextTrack() {
    if (this.playlist.length === 0) return;
    const currentIndex = this.playlist.findIndex((t) => t.id === this.currentTrack?.id);
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    this.selectTrack(this.playlist[nextIndex], this.isPlaying);
  }

  public prevTrack() {
    if (this.playlist.length === 0) return;
    const currentIndex = this.playlist.findIndex((t) => t.id === this.currentTrack?.id);
    const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.selectTrack(this.playlist[prevIndex], this.isPlaying);
  }

  public seek(ratio: number) {
    if (this.audioElement.duration) {
      this.audioElement.currentTime = Math.max(0, Math.min(1, ratio)) * this.audioElement.duration;
    }
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.audioElement.volume = clamped;
  }

  public getVolume(): number {
    return this.audioElement.volume;
  }

  public toggleLoop(): boolean {
    this.isLooping = !this.isLooping;
    this.audioElement.loop = this.isLooping;
    return this.isLooping;
  }

  public getIsLooping(): boolean {
    return this.isLooping;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
}
