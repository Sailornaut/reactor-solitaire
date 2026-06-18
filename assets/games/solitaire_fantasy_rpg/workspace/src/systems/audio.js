import { ASSETS } from '../config/assets.js';

export class AudioSystem {
  constructor() {
    this.enabled = false;
    this.players = new Map();
    this.bgm = new Audio(ASSETS.audio.bgm);
    this.bgm.loop = true;
    this.bgm.volume = 0.28;
    this.urls = {
      hit: ASSETS.audio.magicHit,
      ui: ASSETS.audio.ui,
      limit: ASSETS.audio.limit,
      enemy: ASSETS.audio.enemy
    };
  }

  async unlock() {
    this.enabled = true;
    try {
      this.bgm.currentTime = 0;
      await this.bgm.play();
    } catch {
      this.enabled = false;
    }
  }

  play(name, volume = 0.65) {
    if (!this.enabled) return;
    const url = this.urls[name];
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  }
}
