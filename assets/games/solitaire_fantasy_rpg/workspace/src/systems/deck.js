/**
 * Pure card / deck utilities.
 * No game state, no side effects, no imports.
 * Every function here is independently testable.
 *
 * Card shape: { id, suit, rank, value (1–13), color, faceUp }
 */

const SUITS  = ['♠', '♥', '♦', '♣'];
const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const COLORS = { '♠': 'black', '♣': 'black', '♥': 'red', '♦': 'red' };

/**
 * Build a fresh, ordered 52-card deck.
 * All cards start face-down.
 */
export function createDeck() {
  const cards = [];
  for (const suit of SUITS) {
    RANKS.forEach((rank, index) => {
      cards.push({
        id:     `${rank}${suit}`,
        suit,
        rank,
        value:  index + 1,
        color:  COLORS[suit],
        faceUp: false,
      });
    });
  }
  return cards;
}

/**
 * Fisher-Yates shuffle. Returns a new array; does not mutate input.
 */
export function shuffle(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Klondike deal: distribute a shuffled deck into 7 tableau columns
 * (col 0 gets 1 card, col 1 gets 2, … col 6 gets 7; top card of each is face-up).
 * The remaining 24 undealt cards become the stock (all face-down copies).
 *
 * Works on an internal copy of the input so the caller's array is unchanged.
 * Returns { tableau: Array(7), stock: Array(24) }.
 */
export function dealKlondike(deck) {
  const remaining = [...deck];
  const tableau = Array.from({ length: 7 }, () => []);

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = remaining.pop();
      card.faceUp = row === col;   // only the top card of each column starts face-up
      tableau[col].push(card);
    }
  }

  const stock = remaining.map(c => ({ ...c, faceUp: false }));
  return { tableau, stock };
}
