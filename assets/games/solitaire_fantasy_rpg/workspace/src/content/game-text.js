/**
 * All static user-facing strings that contain no runtime-computed values.
 *
 * Strings intentionally NOT here (they embed runtime values and would need
 * template-function wrappers that add indirection without benefit):
 *   - `Foundation ${rank}${suit}!`          — card identity
 *   - `Revealed ${rank}${suit}. Surge +5%`  — card identity
 *   - `Chain moved x${n}!`                  — move count
 *   - `Braced: -${n} HP, Surge +14%`        — computed damage
 *   - `${prefix} -${n} HP`                  — dynamic prefix + damage
 *   - Hint text templates (card + column)   — multiple runtime values
 */
export const GAME_TEXT = {
  // ── Draw / stock ──────────────────────────────────────────────────────────
  drawCard:           'Drew a battle card. Surge +2%',
  reshufflePunish:    'The Wraith punishes the reshuffle!',

  // ── Foundation feedback ───────────────────────────────────────────────────
  foundationStackOnly: 'Only single cards can channel into foundations.',
  foundationOrder:     'Foundation needs same suit in A → K order.',
  noFoundationMove:    'No safe foundation move right now.',

  // ── Tableau feedback ──────────────────────────────────────────────────────
  tableauRule:  'Tableau needs alternating colors descending.',
  kingOnly:     'Only a King can open an empty lane.',
  tacticalMove: 'Tactical move!',

  // ── Hint ──────────────────────────────────────────────────────────────────
  noHint: 'No obvious move. Draw or brace.',

  // ── Win / lose messages ───────────────────────────────────────────────────
  enemyKilledByDamage:  'The reactor knight shatters into crystal static.',
  foundationsComplete:  'All foundations complete. The city reactor is purified.',
  heroHpZero:           'Your HP hit zero before the foundations could stabilize the reactor.',
  braceLoss:            'You braced, but the reactor surge overwhelmed you.',

  // ── Game flow toasts (main.js) ────────────────────────────────────────────
  missionStart: 'Mission start: defeat the Reactor Wraith with solitaire chains.',
  newRun:       'Deck reshuffled. New run started.',

  // ── Accessibility labels ──────────────────────────────────────────────────
  faceDownCard: 'Face-down battle card',
};

/**
 * Card suit display names.
 * Used for aria-labels and foundation slot labels in the HUD.
 */
export const SUIT_NAMES = {
  '♠': 'Spades',
  '♥': 'Hearts',
  '♦': 'Diamonds',
  '♣': 'Clubs',
};
