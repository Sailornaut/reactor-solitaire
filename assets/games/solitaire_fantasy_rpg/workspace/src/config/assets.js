/**
 * ─── LAUNCH ASSET CHECKLIST ──────────────────────────────────────────────────
 *
 * Place the following files in public/assets/ before shipping to itch.io or
 * any public web host.  Vite copies public/ into dist/ automatically, so
 * every path below will be available at the same URL in the built output.
 *
 * ART  (JPG or PNG — 1024×576 px recommended for backdrops, 512×512 for portraits)
 *   public/assets/art/backdrop.jpg   ← battle background (ruined reactor district)
 *   public/assets/art/hero.jpg       ← hero portrait (mercenary swordsman)
 *   public/assets/art/enemy.jpg      ← enemy portrait (corrupted reactor knight)
 *   public/assets/art/title.jpg      ← title screen key art
 *
 * AUDIO  (MP3, OGG also accepted)
 *   public/assets/audio/bgm.mp3      ← loopable cyber-fantasy battle music
 *   public/assets/audio/sfx-hit.mp3  ← card/magic hit sound effect
 *   public/assets/audio/sfx-ui.mp3   ← UI click / confirm sound
 *   public/assets/audio/sfx-limit.mp3 ← Core Surge activation SFX
 *   public/assets/audio/sfx-enemy.mp3 ← enemy attack SFX
 *
 * MISSING-FILE BEHAVIOR (safe to ship without any files — placeholders below)
 *   Images  → render-scene.js falls back to procedural canvas textures.
 *   Audio   → AudioSystem silently no-ops; game is fully playable without sound.
 *
 * ─── ARCHIVED REMOTE URLS (private CDN — do not restore for public release) ──
 *   battleBackdrop: https://seeleh5.blob.core.windows.net/kokokeepall/seedream_image_gen/24213b2ef9374b97a559780e9917a00f_2150d980-4946-49d6-9ab1-5e3d4f7c2f6f/7447371e9eef4abdab8e08beece715ed.jpg
 *   heroPortrait:   https://seeleh5.blob.core.windows.net/kokokeepall/seedream_image_gen/b35a130d4ffc4e53a01b1fa839235f4a_31ba0d0f-64f0-4e35-9680-3415b60e31ec/89b635e4e05d4b9182472f7d6bfbb41d.jpg
 *   enemyPortrait:  https://seeleh5.blob.core.windows.net/kokokeepall/seedream_image_gen/7fd6c6c8c3a44e0e9390c1d89f55cb7f_8735b469-79dd-44c9-bafe-512a5bdcaaea/e1f90d346f41497eb0cd152b8aa16622.jpg
 *   titleArt:       https://seeleh5.blob.core.windows.net/kokokeepall/seedream_image_gen/0985cdfe37184673a6942ff10e363543_6fd575e4-a6cb-4035-a644-6372c55c4abb/fee9be11336b4406b7028621d9735eef.jpg
 *   bgm:            https://static.seeles.ai/data/asset/export/3f6b0dcf-b6e8-40df-9bfb-4be325d41a48/128887/bgm_d4cd7e46-06f4-405c-95d6-35d439525e3b.mp3
 *   magicHit:       https://static.seeles.ai/data/asset/export/14fac41d-14d6-4dc2-b23b-4f60da7d3434/171936/sfx_c0255cee-9334-4b00-9d32-c7d8f4106993.mp3
 *   ui:             https://static.seeles.ai/data/asset/export/90002a6e-f0f8-4389-87dd-0c4d97d95301/173924/sfx_bc3378f0-dcad-4ff2-8d9f-14bae488e11c.mp3
 *   limit:          https://static.seeles.ai/data/asset/export/364a7587-188f-404b-9d02-8ae510043259/174050/sfx_7a9dfc50-ab46-4b0d-83f5-fc38bc75398a.mp3
 *   enemy (sfx):    https://static.seeles.ai/data/asset/export/caf90309-e51f-4ab7-b931-417501b8e3df/174215/sfx_dea2daed-b76e-4cbd-b371-d4e13a87d00a.mp3
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ASSETS = {
  art: {
    // TODO: add public/assets/art/backdrop.jpg
    battleBackdrop: '/assets/art/backdrop.jpg',
    // TODO: add public/assets/art/hero.jpg
    heroPortrait:   '/assets/art/hero.jpg',
    // TODO: add public/assets/art/enemy.jpg
    enemyPortrait:  '/assets/art/enemy.jpg',
    // TODO: add public/assets/art/title.jpg
    titleArt:       '/assets/art/title.jpg',
  },
  audio: {
    // TODO: add public/assets/audio/bgm.mp3
    bgm:      '/assets/audio/bgm.mp3',
    // TODO: add public/assets/audio/sfx-hit.mp3
    magicHit: '/assets/audio/sfx-hit.mp3',
    // TODO: add public/assets/audio/sfx-ui.mp3
    ui:       '/assets/audio/sfx-ui.mp3',
    // TODO: add public/assets/audio/sfx-limit.mp3
    limit:    '/assets/audio/sfx-limit.mp3',
    // TODO: add public/assets/audio/sfx-enemy.mp3
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
