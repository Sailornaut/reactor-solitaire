const STORAGE_KEY = 'reactor-solitaire-progress';

const XP_PER_LEVEL = 100;
const BASE_WIN_XP = 40;
const BASE_LOSS_XP = 10;
const DRAW3_MULTIPLIER = 1.5;

const ENCOUNTER_XP_BONUS = [0, 5, 10, 15, 20, 30];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        xp: data.xp ?? 0,
        level: data.level ?? 1,
        totalWins: data.totalWins ?? 0,
        totalLosses: data.totalLosses ?? 0,
        difficulty: data.difficulty ?? 'draw1',
      };
    }
  } catch { /* corrupted data — start fresh */ }
  return { xp: 0, level: 1, totalWins: 0, totalLosses: 0, difficulty: 'draw1' };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* storage full or blocked — silently fail */ }
}

export function calculateXpGain(won, encounterIndex, difficulty) {
  let xp = won ? BASE_WIN_XP : BASE_LOSS_XP;
  xp += ENCOUNTER_XP_BONUS[encounterIndex] ?? 0;
  if (difficulty === 'draw3') xp = Math.floor(xp * DRAW3_MULTIPLIER);
  return xp;
}

export function addXp(progress, amount) {
  progress.xp += amount;
  while (progress.xp >= XP_PER_LEVEL) {
    progress.xp -= XP_PER_LEVEL;
    progress.level++;
  }
  return progress;
}

export function xpToNextLevel() {
  return XP_PER_LEVEL;
}

export function setDifficulty(progress, difficulty) {
  progress.difficulty = difficulty;
  return progress;
}
