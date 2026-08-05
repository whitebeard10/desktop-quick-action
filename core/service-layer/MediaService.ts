import { eventBus } from '../event-bus';

export interface MediaState {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
  volumePct: number;
}

export class MediaService {
  private mediaState: MediaState = {
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=80',
    isPlaying: true,
    progressSec: 84,
    durationSec: 243,
    volumePct: 75,
  };

  private timerId: number | null = null;

  constructor() {
    this.startTimer();
  }

  private startTimer() {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => {
      if (this.mediaState.isPlaying) {
        this.mediaState.progressSec += 1;
        if (this.mediaState.progressSec >= this.mediaState.durationSec) {
          this.mediaState.progressSec = 0;
        }
        eventBus.emit('MEDIA_STATE_UPDATED', this.mediaState);
      }
    }, 1000);
  }

  public getMediaState(): MediaState {
    return this.mediaState;
  }

  public togglePlayPause() {
    this.mediaState.isPlaying = !this.mediaState.isPlaying;
    eventBus.emit('MEDIA_STATE_UPDATED', this.mediaState);
  }

  public nextTrack() {
    const playlist = [
      { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', durationSec: 243 },
      { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', durationSec: 230 },
      { title: 'Resonance', artist: 'HOME', album: 'Odyssey', durationSec: 212 },
    ];
    const currentIndex = playlist.findIndex((t) => t.title === this.mediaState.title);
    const nextItem = playlist[(currentIndex + 1) % playlist.length];

    this.mediaState = {
      ...this.mediaState,
      ...nextItem,
      progressSec: 0,
      isPlaying: true,
    };
    eventBus.emit('MEDIA_STATE_UPDATED', this.mediaState);
  }

  public setVolume(volumePct: number) {
    this.mediaState.volumePct = Math.max(0, Math.min(100, volumePct));
    eventBus.emit('MEDIA_STATE_UPDATED', this.mediaState);
  }
}

export const mediaService = new MediaService();
