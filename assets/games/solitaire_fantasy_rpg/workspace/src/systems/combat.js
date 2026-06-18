import { ATTACKS } from '../content/attacks.js';
import { STARTING_ENEMY } from '../content/enemies.js';
import { GAME_TEXT } from '../content/game-text.js';

const HERO_MAX_HP = 100;
const SURGE_MAX = 100;
const PLAYER_COMBO_DAMAGE_CAP = 14;
const PLAYER_COMBO_DAMAGE_STEP = 2;
const PLAYER_DAMAGE_SURGE_RATIO = 0.45;
const DRAW_SURGE_GAIN = 2;
const REVEAL_SURGE_GAIN = 5;
const ENEMY_HIT_SURGE_GAIN = 10;
const BRACE_SURGE_GAIN = 14;
const ENEMY_INTENT_MAX = 24;
const ENEMY_INTENT_BASE_GAIN = 2;
const ENEMY_INTENT_MOVE_DIVISOR = 12;
const BRACE_DAMAGE_RATIO = 0.55;
const BRACE_MIN_DAMAGE = 4;
const CORE_SURGE_BASE_DAMAGE = 42;

export function createHeroState() {
  return { hp: HERO_MAX_HP, maxHp: HERO_MAX_HP, limit: 0 };
}

export function createEnemyState(enemy = STARTING_ENEMY) {
  return { ...enemy };
}

export function gainDrawSurge(hero) {
  return gainSurge(hero, DRAW_SURGE_GAIN);
}

export function gainRevealSurge(hero) {
  return gainSurge(hero, REVEAL_SURGE_GAIN);
}

export function gainSurge(hero, amount) {
  hero.limit = Math.min(SURGE_MAX, hero.limit + amount);
  return hero.limit;
}

export function applyPlayerDamage(hero, enemy, amount, combo) {
  const nextCombo = combo + 1;
  const damage = amount + Math.min(PLAYER_COMBO_DAMAGE_CAP, nextCombo * PLAYER_COMBO_DAMAGE_STEP);

  enemy.hp = Math.max(0, enemy.hp - damage);
  gainSurge(hero, Math.ceil(damage * PLAYER_DAMAGE_SURGE_RATIO));

  return {
    damage,
    combo: nextCombo,
    enemyDefeated: enemy.hp <= 0,
    winMessage: GAME_TEXT.enemyKilledByDamage,
  };
}

export function applyEnemyAttack(hero, enemy, moves) {
  const damage = enemy.intent;

  hero.hp = Math.max(0, hero.hp - damage);
  gainSurge(hero, ENEMY_HIT_SURGE_GAIN);
  enemy.intent = Math.min(
    ENEMY_INTENT_MAX,
    enemy.intent + ENEMY_INTENT_BASE_GAIN + Math.floor(moves / ENEMY_INTENT_MOVE_DIVISOR)
  );

  return {
    damage,
    heroDefeated: hero.hp <= 0,
    lossMessage: GAME_TEXT.heroHpZero,
  };
}

export function applyBrace(hero, enemy) {
  const damage = Math.max(BRACE_MIN_DAMAGE, Math.floor(enemy.intent * BRACE_DAMAGE_RATIO));

  hero.hp = Math.max(0, hero.hp - damage);
  gainSurge(hero, BRACE_SURGE_GAIN);

  return {
    damage,
    heroDefeated: hero.hp <= 0,
    lossMessage: GAME_TEXT.braceLoss,
  };
}

export function activateCoreSurge(hero, enemy, faceUpCardCount) {
  if (hero.limit < SURGE_MAX) return null;

  hero.limit = 0;
  const damage = CORE_SURGE_BASE_DAMAGE + faceUpCardCount;
  enemy.hp = Math.max(0, enemy.hp - damage);

  return {
    damage,
    label: ATTACKS.coreSurge.label,
    enemyDefeated: enemy.hp <= 0,
    winMessage: ATTACKS.coreSurge.killMessage,
  };
}
