/**
 * Pure Klondike solitaire rule predicates.
 * No imports, no state, no side effects. Every function is independently testable.
 *
 * These replace inline logic that appeared verbatim in more than one place inside
 * SolitaireCombat (moveSelectedToTableau and findHint both contained the same
 * tableau-legality expression).
 */

/**
 * Can `card` be placed on top of `topCard` in a tableau column?
 *
 * Klondike tableau rules:
 *   - Target must be face-up.
 *   - Card must be the opposite color to the target.
 *   - Card's value must be exactly one less than the target's value.
 *   - An empty column (topCard null/undefined) accepts only a King (value 13).
 *
 * @param {{ value: number, color: string }} card      - the card being moved
 * @param {{ value: number, color: string, faceUp: boolean } | null | undefined} topCard
 * @returns {boolean}
 */
export function canPlaceOnTableau(card, topCard) {
  if (!topCard) return card.value === 13;
  return topCard.faceUp && topCard.color !== card.color && topCard.value === card.value + 1;
}

/**
 * Can `card` be moved to a foundation pile?
 *
 * Klondike foundation rules:
 *   - Foundations build up by suit, A → K.
 *   - The next card to be accepted is always (current stack length + 1).
 *   - Suit-matching is the caller's responsibility (the caller targets a specific
 *     suit slot before calling this function).
 *
 * @param {{ value: number }} card
 * @param {object[]} foundationStack - current cards in the target suit's foundation
 * @returns {boolean}
 */
export function canMoveToFoundation(card, foundationStack) {
  return card.value === foundationStack.length + 1;
}

/**
 * Have all four foundation piles been completed (A → K, 13 cards each)?
 *
 * @param {{ '♠': object[], '♥': object[], '♦': object[], '♣': object[] }} foundations
 * @returns {boolean}
 */
export function isFoundationsComplete(foundations) {
  return Object.values(foundations).every(stack => stack.length === 13);
}
