/**
 * Enemy definitions.
 * Combat numbers (hp, maxHp, intent, phase) live here alongside
 * the display name so both can be updated from one place.
 */
export const ENEMIES = {
  reactorWraith: {
    name: 'Reactor Wraith',
    hp: 110,
    maxHp: 110,
    intent: 12,
    phase: 1,
  },
};

/** The enemy used at game start. Spread into state so resets are independent. */
export const STARTING_ENEMY = ENEMIES.reactorWraith;
