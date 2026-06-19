import { asset } from '../config/assets.js';

/**
 * Background theme definitions for Reactor Solitaire: Core Surge.
 *
 * Each theme drives the following visual properties in RenderScene:
 *   backdrop       — local path for the full-scene background image
 *   particleColor  — color of the persistent crystal shard particles
 *   veilColor      — color of the semi-transparent darkening plane
 *   veilOpacity    — opacity of that plane (higher = darker, more oppressive)
 *
 * backdrop files live in public/assets/art/ and fall back to the procedural
 * canvas texture in render-scene.js if the file is missing.
 */
export const BACKGROUNDS = {
  /**
   * Rainy Reactor District — the original default.
   * Midnight-blue atmosphere, cold cyan crystals, heavy veil.
   */
  rainyReactorDistrict: {
    label: 'Rainy Reactor District',
    backdrop: asset('assets/art/rainy-reactor.png'),
    particleColor: 0x60f7ff,  // cold cyan
    veilColor: 0x050812,
    veilOpacity: 0.28,
  },

  /**
   * Neon Market Alley — warmer, more chaotic.
   * Hot-pink crystal shards, lighter veil lets the backdrop breathe.
   */
  neonMarketAlley: {
    label: 'Neon Market Alley',
    backdrop: asset('assets/art/neon-market.png'),
    particleColor: 0xff4fa3,  // hot magenta
    veilColor: 0x0a0308,
    veilOpacity: 0.20,
  },

  /**
   * Corporate Skybridge — sterile, high-altitude cold.
   * Mint-green shards, heavier veil for oppressive corporate feel.
   */
  corporateSkybridge: {
    label: 'Corporate Skybridge',
    backdrop: asset('assets/art/skybridge.png'),
    particleColor: 0x4dffb0,  // mint green
    veilColor: 0x02090c,
    veilOpacity: 0.34,
  },
};

/**
 * Maps each encounter index (position in ENCOUNTER_ORDER) to a background key.
 * Indexed in sync with ENCOUNTER_ORDER in enemies.js.
 */
export const ENCOUNTER_BACKGROUNDS = [
  'rainyReactorDistrict',  // 0 — Reactor Wraith    (default, preserved)
  'rainyReactorDistrict',  // 1 — Drone Warden      (same district, early run)
  'neonMarketAlley',       // 2 — Glassblade Specter (market chaos)
  'neonMarketAlley',       // 3 — Corporate Knight   (neon-lit district)
  'corporateSkybridge',    // 4 — Sludge Revenant    (high-altitude grind)
  'corporateSkybridge',    // 5 — Core Seraph        (boss: cold corporate sky)
];
