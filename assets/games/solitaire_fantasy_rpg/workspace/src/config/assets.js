/**
 * ─── LAUNCH ASSET CHECKLIST ──────────────────────────────────────────────────
 *
 * Place the following files in public/assets/ before shipping to itch.io or
 * any public web host.  Vite copies public/ into dist/ automatically, so
 * every path below will be available at the same URL in the built output.
 *
 * ART  (PNG or JPG — 1024×576 px for backdrops, 512×512 px for portraits)
 *
 *   Title screen (shown before a run starts):
 *   public/assets/art/backdrop.png    ← default background during loading/title
 *   public/assets/art/hero.jpg        ← hero portrait (title screen)
 *   public/assets/art/title.jpg       ← title screen key art
 *   (enemy portrait on title screen reuses reactor-wraith.png)
 *
 *   Per-encounter backgrounds (swap in at mission start):
 *   public/assets/art/rainy-reactor.png  ← encounters 0–1 (Reactor Wraith, Drone Warden)
 *   public/assets/art/neon-market.png    ← encounters 2–3 (Glassblade Specter, Corporate Knight)
 *   public/assets/art/skybridge.png      ← encounters 4–5 (Sludge Revenant, Core Seraph)
 *
 *   Per-enemy portraits (swap in at mission start):
 *   public/assets/art/reactor-wraith.png
 *   public/assets/art/drone-warden.png
 *   public/assets/art/glassblade-specter.png
 *   public/assets/art/corporate-knight.png
 *   public/assets/art/sludge-revenant.png
 *   public/assets/art/core-seraph.png
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
    battleBackdrop: '/assets/art/backdrop.png',
    heroPortrait:   '/assets/art/hero.jpg',
    enemyPortrait:  '/assets/art/reactor-wraith.png', // title screen default; swapped per-encounter at mission start
    titleArt:       '/assets/art/title.jpg',
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
