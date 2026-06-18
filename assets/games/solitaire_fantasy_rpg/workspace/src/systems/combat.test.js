import { describe, expect, it } from 'vitest';
import { STARTING_ENEMY } from '../content/enemies.js';
import {
  activateCoreSurge,
  applyBrace,
  applyEnemyAttack,
  applyPlayerDamage,
  createEnemyState,
  createHeroState,
  gainDrawSurge,
  gainRevealSurge,
} from './combat.js';

// ── createHeroState ───────────────────────────────────────────────────────────

describe('createHeroState', () => {
  it('starts at 100 HP', () => {
    const hero = createHeroState();
    expect(hero.hp).toBe(100);
    expect(hero.maxHp).toBe(100);
  });

  it('starts at 0 Surge (limit)', () => {
    expect(createHeroState().limit).toBe(0);
  });

  it('returns an independent object on each call', () => {
    expect(createHeroState()).not.toBe(createHeroState());
  });
});

// ── createEnemyState ──────────────────────────────────────────────────────────

describe('createEnemyState', () => {
  it('matches STARTING_ENEMY shape and values', () => {
    const enemy = createEnemyState();
    expect(enemy.name).toBe(STARTING_ENEMY.name);
    expect(enemy.hp).toBe(STARTING_ENEMY.hp);
    expect(enemy.maxHp).toBe(STARTING_ENEMY.maxHp);
    expect(enemy.intent).toBe(STARTING_ENEMY.intent);
    expect(enemy.phase).toBe(STARTING_ENEMY.phase);
  });

  it('returns an independent copy (not the same reference as STARTING_ENEMY)', () => {
    expect(createEnemyState()).not.toBe(STARTING_ENEMY);
  });
});

// ── gainDrawSurge ─────────────────────────────────────────────────────────────

describe('gainDrawSurge', () => {
  it('adds +2 Surge', () => {
    const hero = createHeroState();
    gainDrawSurge(hero);
    expect(hero.limit).toBe(2);
  });

  it('stacks correctly over multiple draws', () => {
    const hero = createHeroState();
    gainDrawSurge(hero);
    gainDrawSurge(hero);
    expect(hero.limit).toBe(4);
  });

  it('caps at 100', () => {
    const hero = createHeroState();
    hero.limit = 99;
    gainDrawSurge(hero);
    expect(hero.limit).toBe(100);
  });

  it('stays at 100 when already full', () => {
    const hero = createHeroState();
    hero.limit = 100;
    gainDrawSurge(hero);
    expect(hero.limit).toBe(100);
  });
});

// ── gainRevealSurge ───────────────────────────────────────────────────────────

describe('gainRevealSurge', () => {
  it('adds +5 Surge', () => {
    const hero = createHeroState();
    gainRevealSurge(hero);
    expect(hero.limit).toBe(5);
  });

  it('caps at 100', () => {
    const hero = createHeroState();
    hero.limit = 97;
    gainRevealSurge(hero);
    expect(hero.limit).toBe(100);
  });
});

// ── applyPlayerDamage ─────────────────────────────────────────────────────────

describe('applyPlayerDamage', () => {
  it('increments combo by 1', () => {
    const result = applyPlayerDamage(createHeroState(), createEnemyState(), 5, 0);
    expect(result.combo).toBe(1);
  });

  it('combo=0 → bonus 2, total damage = amount + 2', () => {
    // nextCombo=1, bonus = min(14, 1*2) = 2
    const result = applyPlayerDamage(createHeroState(), createEnemyState(), 5, 0);
    expect(result.damage).toBe(7);
  });

  it('combo=2 → bonus 6, total damage = amount + 6', () => {
    // nextCombo=3, bonus = min(14, 3*2) = 6
    const result = applyPlayerDamage(createHeroState(), createEnemyState(), 5, 2);
    expect(result.damage).toBe(11);
  });

  it('combo bonus caps at 14 (combo >= 7)', () => {
    // nextCombo=8, bonus = min(14, 8*2) = 14
    const result = applyPlayerDamage(createHeroState(), createEnemyState(), 5, 7);
    expect(result.damage).toBe(19);
  });

  it('deals damage to enemy HP', () => {
    const enemy = createEnemyState();
    const result = applyPlayerDamage(createHeroState(), enemy, 5, 0);
    expect(enemy.hp).toBe(STARTING_ENEMY.hp - result.damage);
  });

  it('clamps enemy HP to 0', () => {
    const enemy = createEnemyState();
    enemy.hp = 1;
    applyPlayerDamage(createHeroState(), enemy, 100, 0);
    expect(enemy.hp).toBe(0);
  });

  it('signals enemyDefeated when HP reaches 0', () => {
    const enemy = createEnemyState();
    enemy.hp = 1;
    const result = applyPlayerDamage(createHeroState(), enemy, 100, 0);
    expect(result.enemyDefeated).toBe(true);
  });

  it('signals enemyDefeated false when enemy survives', () => {
    const result = applyPlayerDamage(createHeroState(), createEnemyState(), 1, 0);
    expect(result.enemyDefeated).toBe(false);
  });

  it('grants Surge equal to ceil(damage * 0.45)', () => {
    const hero = createHeroState();
    const result = applyPlayerDamage(hero, createEnemyState(), 5, 0);
    // damage=7, ceil(7 * 0.45) = ceil(3.15) = 4
    expect(hero.limit).toBe(Math.ceil(result.damage * 0.45));
  });
});

// ── applyEnemyAttack ──────────────────────────────────────────────────────────

describe('applyEnemyAttack', () => {
  it('damage equals enemy.intent', () => {
    const enemy = createEnemyState(); // intent = 12
    const result = applyEnemyAttack(createHeroState(), enemy, 0);
    expect(result.damage).toBe(12);
  });

  it('reduces hero HP by the damage amount', () => {
    const hero = createHeroState();
    const enemy = createEnemyState();
    const result = applyEnemyAttack(hero, enemy, 0);
    expect(hero.hp).toBe(100 - result.damage);
  });

  it('clamps hero HP to 0', () => {
    const hero = createHeroState();
    hero.hp = 5;
    const enemy = createEnemyState();
    enemy.intent = 100;
    applyEnemyAttack(hero, enemy, 0);
    expect(hero.hp).toBe(0);
  });

  it('signals heroDefeated when HP reaches 0', () => {
    const hero = createHeroState();
    hero.hp = 5;
    const enemy = createEnemyState();
    enemy.intent = 100;
    const result = applyEnemyAttack(hero, enemy, 0);
    expect(result.heroDefeated).toBe(true);
  });

  it('grants +10 Surge to hero', () => {
    const hero = createHeroState();
    applyEnemyAttack(hero, createEnemyState(), 0);
    expect(hero.limit).toBe(10);
  });

  it('scales intent: new = min(24, intent + 2 + floor(moves/12))', () => {
    const enemy = createEnemyState(); // intent = 12
    // moves=0 → 12 + 2 + 0 = 14
    applyEnemyAttack(createHeroState(), enemy, 0);
    expect(enemy.intent).toBe(14);
  });

  it('intent scaling uses moves correctly (moves=12 adds 1 extra)', () => {
    const enemy = createEnemyState(); // intent = 12
    // moves=12 → 12 + 2 + 1 = 15
    applyEnemyAttack(createHeroState(), enemy, 12);
    expect(enemy.intent).toBe(15);
  });

  it('caps intent at 24', () => {
    const enemy = createEnemyState();
    enemy.intent = 23;
    // 23 + 2 + 0 = 25, capped at 24
    applyEnemyAttack(createHeroState(), enemy, 0);
    expect(enemy.intent).toBe(24);
  });
});

// ── applyBrace ────────────────────────────────────────────────────────────────

describe('applyBrace', () => {
  it('damage = Math.max(4, Math.floor(intent * 0.55))', () => {
    const enemy = createEnemyState(); // intent = 12
    const expected = Math.max(4, Math.floor(12 * 0.55)); // = 6
    const result = applyBrace(createHeroState(), enemy);
    expect(result.damage).toBe(expected);
  });

  it('minimum damage is 4 when floor(intent * 0.55) < 4', () => {
    const enemy = createEnemyState();
    enemy.intent = 1; // floor(1 * 0.55) = 0, min is 4
    const result = applyBrace(createHeroState(), enemy);
    expect(result.damage).toBe(4);
  });

  it('reduces hero HP by the damage amount', () => {
    const hero = createHeroState();
    const result = applyBrace(hero, createEnemyState());
    expect(hero.hp).toBe(100 - result.damage);
  });

  it('clamps hero HP to 0', () => {
    const hero = createHeroState();
    hero.hp = 1;
    const enemy = createEnemyState();
    enemy.intent = 100;
    applyBrace(hero, enemy);
    expect(hero.hp).toBe(0);
  });

  it('grants +14 Surge', () => {
    const hero = createHeroState();
    applyBrace(hero, createEnemyState());
    expect(hero.limit).toBe(14);
  });

  it('signals heroDefeated when HP reaches 0', () => {
    const hero = createHeroState();
    hero.hp = 1;
    const enemy = createEnemyState();
    enemy.intent = 100;
    const result = applyBrace(hero, enemy);
    expect(result.heroDefeated).toBe(true);
  });

  it('signals heroDefeated false when hero survives', () => {
    const result = applyBrace(createHeroState(), createEnemyState());
    expect(result.heroDefeated).toBe(false);
  });
});

// ── activateCoreSurge ─────────────────────────────────────────────────────────

describe('activateCoreSurge', () => {
  it('returns null when Surge is 0', () => {
    const hero = createHeroState(); // limit = 0
    expect(activateCoreSurge(hero, createEnemyState(), 10)).toBeNull();
  });

  it('returns null when Surge is 99 (below 100)', () => {
    const hero = createHeroState();
    hero.limit = 99;
    expect(activateCoreSurge(hero, createEnemyState(), 10)).toBeNull();
  });

  it('activates at exactly 100 Surge', () => {
    const hero = createHeroState();
    hero.limit = 100;
    expect(activateCoreSurge(hero, createEnemyState(), 0)).not.toBeNull();
  });

  it('damage = 42 + faceUpCardCount', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const result = activateCoreSurge(hero, createEnemyState(), 10);
    expect(result.damage).toBe(52);
  });

  it('damage = 42 when faceUpCardCount is 0', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const result = activateCoreSurge(hero, createEnemyState(), 0);
    expect(result.damage).toBe(42);
  });

  it('resets Surge to 0', () => {
    const hero = createHeroState();
    hero.limit = 100;
    activateCoreSurge(hero, createEnemyState(), 5);
    expect(hero.limit).toBe(0);
  });

  it('reduces enemy HP by the damage amount', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const enemy = createEnemyState();
    const result = activateCoreSurge(hero, enemy, 0);
    expect(enemy.hp).toBe(STARTING_ENEMY.hp - result.damage);
  });

  it('clamps enemy HP to 0', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const enemy = createEnemyState();
    enemy.hp = 1;
    activateCoreSurge(hero, enemy, 0);
    expect(enemy.hp).toBe(0);
  });

  it('signals enemyDefeated when HP reaches 0', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const enemy = createEnemyState();
    enemy.hp = 1;
    const result = activateCoreSurge(hero, enemy, 0);
    expect(result.enemyDefeated).toBe(true);
  });

  it('signals enemyDefeated false when enemy survives', () => {
    const hero = createHeroState();
    hero.limit = 100;
    const result = activateCoreSurge(hero, createEnemyState(), 0);
    // STARTING_ENEMY.hp = 110, damage = 42, so 68 hp remaining
    expect(result.enemyDefeated).toBe(false);
  });
});
