/**
 * ─── LAUNCH ASSET CHECKLIST ──────────────────────────────────────────────────
 *
 * Place the following files in public/assets/ before shipping to itch.io or
 * any public web host.  Vite copies public/ into dist/ automatically, so
 * every path below will be available at the same URL in the built output.
 *
 * ART  (JPG or PNG — 1024×576 px recommended for backdrops, 512×512 for portraits)
 *   public/assets/art/backdrop.jpg    ← battle background (ruined reactor district)
 *   public/assets/art/hero.jpg        ← hero portrait (mercenary swordsman)
 *   public/assets/art/enemy.jpg       ← enemy portrait (corrupted reactor knight)
 *   public/assets/art/title.jpg       ← title screen key art
 *
 * AUDIO  (MP3 — OGG also works, update extensions to match your files)
 *   public/assets/audio/bgm.mp3       ← loopable cyber-fantasy battle music
 *   public/assets/audio/sfx-hit.mp3   ← card/magic hit sound effect
 *   public/assets/audio/sfx-ui.mp3    ← UI click / confirm sound
 *   public/assets/audio/sfx-limit.mp3 ← Core Surge activation SFX
 *   public/assets/audio/sfx-enemy.mp3 ← enemy attack SFX
 *
 * MISSING-FILE BEHAVIOR (safe to ship without any files)
 *   Images → render-scene.js falls back to procedural canvas textures.
 *   Audio  → AudioSystem silently no-ops; game is fully playable without sound.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ASSETS = {
  art: {
    battleBackdrop: '/assets/art/backdrop.jpg',  // TODO: add public/assets/art/backdrop.jpg
    heroPortrait:   '/assets/art/hero.jpg',       // TODO: add public/assets/art/hero.jpg
    enemyPortrait:  '/assets/art/enemy.jpg',      // TODO: add public/assets/art/enemy.jpg
    titleArt:       '/assets/art/title.jpg',      // TODO: add public/assets/art/title.jpg
  },
  audio: {
    bgm:      '/assets/audio/bgm.mp3',
    magicHit: '/assets/audio/sfx-hit.mp3',
    ui:       '/assets/audio/sfx-ui.mp3',
    limit:    '/assets/audio/sfx-limit.mp3',
    enemy:    '/assets/audio/sfx-enemy.mp3',
  },
};

export const ASSET_MANIFEST = `
ASSET MANIFEST — Reactor Solitaire: Core Surge
Art direction: original 1990s cyber-fantasy RPG homage, neon reactor city, anime-painterly portraits. No copyrighted FF7 characters/assets.
Platform: PC + mobile browser

ENTITIES
- Hero portrait | GENERATE | original mercenary swordsman portrait | ASSETS.art.heroPortrait
- Enemy portrait | GENERATE | original corrupted reactor knight boss | ASSETS.art.enemyPortrait
- Playing cards | PROCEDURAL | DOM/CSS cards as abstract game pieces, styled not character art | n/a
ENVIRONMENT
- Battle backdrop | GENERATE | ruined reactor district background | ASSETS.art.battleBackdrop
- Title art | GENERATE | key art for menu | ASSETS.art.titleArt
AUDIO
- BGM | RETRIEVE | loopable cyber-fantasy battle music | ASSETS.audio.bgm
- Magic hit / UI / Limit / enemy SFX | RETRIEVE | card, magic, slash feedback | ASSETS.audio.*
PROCEDURAL
- Three.js particles, glow, screen shake, HUD, solitaire layout, card logic, combat math
`;
