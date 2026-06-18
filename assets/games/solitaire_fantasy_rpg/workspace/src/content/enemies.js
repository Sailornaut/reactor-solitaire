/**
 * Enemy definitions.
 * Combat numbers (hp, maxHp, intent, phase) live here alongside
 * the display name so both can be updated from one place.
 *
 * All enemies share the shape expected by combat.js:
 *   { name, hp, maxHp, intent, phase }
 */
export const ENEMIES = {
  /** Tutorial / default — familiar threat from the original build. */
  reactorWraith: {
    name: 'Reactor Wraith',
    hp: 110,
    maxHp: 110,
    intent: 12,
    phase: 1,
  },

  /**
   * Drone Warden — low HP, low intent.
   * Attacks hit frequently but lightly; take it down before it wears you out.
   */
  droneWarden: {
    name: 'Drone Warden',
    hp: 75,
    maxHp: 75,
    intent: 8,
    phase: 1,
  },

  /**
   * Glassblade Specter — medium HP, high intent.
   * Charges heavy strikes; each enemy attack hits hard.
   */
  glassbladeSpecter: {
    name: 'Glassblade Specter',
    hp: 90,
    maxHp: 90,
    intent: 16,
    phase: 1,
  },

  /**
   * Sludge Revenant — high HP, slow intent.
   * An attrition battle: outlast its relentless bulk or be ground down.
   */
  sludgeRevenant: {
    name: 'Sludge Revenant',
    hp: 155,
    maxHp: 155,
    intent: 10,
    phase: 1,
  },

  /**
   * Corporate Knight — armored adversary (flavor only for now).
   * High HP, steady intent; punishes passive play.
   */
  corporateKnight: {
    name: 'Corporate Knight',
    hp: 135,
    maxHp: 135,
    intent: 14,
    phase: 1,
  },

  /**
   * Core Seraph — boss.
   * Maximum HP and intent; every mistake is punished severely.
   */
  coreSeraph: {
    name: 'Core Seraph',
    hp: 200,
    maxHp: 200,
    intent: 18,
    phase: 1,
  },
};

/**
 * Linear encounter order used by SolitaireCombat.
 * Index 0 is always the tutorial enemy so first-run behavior is unchanged.
 * After completing all encounters the cycle wraps around.
 */
export const ENCOUNTER_ORDER = [
  ENEMIES.reactorWraith,
  ENEMIES.droneWarden,
  ENEMIES.glassbladeSpecter,
  ENEMIES.corporateKnight,
  ENEMIES.sludgeRevenant,
  ENEMIES.coreSeraph,
];

/** The enemy used at game start. Spread into state so resets are independent. */
export const STARTING_ENEMY = ENEMIES.reactorWraith;
