/**
 * Player attack definitions.
 * Each entry holds the display strings shown during and after the attack.
 * Damage values and mechanics stay in solitaire-combat.js.
 */
export const ATTACKS = {
  coreSurge: {
    /** Toast shown as the damage number flies. */
    label: 'CORE SURGE: Photon Rend!',
    /** Game-over win body when Core Surge delivers the killing blow. */
    killMessage: 'Your Core Surge cuts through the reactor core.',
  },
};
