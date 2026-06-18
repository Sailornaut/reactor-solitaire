import { beforeEach, describe, expect, it } from 'vitest';
import { createDeck, dealKlondike, shuffle } from './deck.js';

// ── createDeck ────────────────────────────────────────────────────────────────

describe('createDeck', () => {
  it('returns 52 cards', () => {
    expect(createDeck()).toHaveLength(52);
  });

  it('first card is A♠ with value 1 and color black', () => {
    const deck = createDeck();
    expect(deck[0]).toMatchObject({ id: 'A♠', rank: 'A', suit: '♠', value: 1, color: 'black' });
  });

  it('last card is K♣ with value 13 and color black', () => {
    const deck = createDeck();
    expect(deck[51]).toMatchObject({ id: 'K♣', rank: 'K', suit: '♣', value: 13, color: 'black' });
  });

  it('values run 1–13 for each suit in order', () => {
    const deck = createDeck();
    // Spades: indices 0–12
    for (let i = 0; i < 13; i++) {
      expect(deck[i].value).toBe(i + 1);
    }
  });

  it('contains exactly 4 suits, 13 ranks, no duplicates', () => {
    const deck = createDeck();
    const ids = deck.map(c => c.id);
    expect(new Set(ids).size).toBe(52);
    expect(new Set(deck.map(c => c.suit)).size).toBe(4);
    expect(new Set(deck.map(c => c.rank)).size).toBe(13);
  });

  it('all cards start face-down', () => {
    expect(createDeck().every(c => !c.faceUp)).toBe(true);
  });

  it('red suits are hearts and diamonds', () => {
    const deck = createDeck();
    const red = deck.filter(c => c.color === 'red').map(c => c.suit);
    expect(new Set(red)).toEqual(new Set(['♥', '♦']));
  });
});

// ── shuffle ───────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns a new array', () => {
    const deck = createDeck();
    expect(shuffle(deck)).not.toBe(deck);
  });

  it('preserves length', () => {
    expect(shuffle(createDeck())).toHaveLength(52);
  });

  it('preserves all card ids (no cards lost or duplicated)', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled.map(c => c.id).sort()).toEqual(deck.map(c => c.id).sort());
  });

  it('does not mutate the input array', () => {
    const deck = createDeck();
    const originalIds = deck.map(c => c.id);
    shuffle(deck);
    expect(deck.map(c => c.id)).toEqual(originalIds);
  });
});

// ── dealKlondike ──────────────────────────────────────────────────────────────

describe('dealKlondike', () => {
  let tableau, stock;

  beforeEach(() => {
    ({ tableau, stock } = dealKlondike(shuffle(createDeck())));
  });

  it('creates exactly 7 tableau columns', () => {
    expect(tableau).toHaveLength(7);
  });

  it('column sizes are 1 through 7', () => {
    tableau.forEach((col, i) => expect(col).toHaveLength(i + 1));
  });

  it('only the top (last) card of each column is face-up', () => {
    for (const col of tableau) {
      for (let i = 0; i < col.length; i++) {
        expect(col[i].faceUp).toBe(i === col.length - 1);
      }
    }
  });

  it('stock has 24 cards', () => {
    expect(stock).toHaveLength(24);
  });

  it('all stock cards are face-down', () => {
    expect(stock.every(c => !c.faceUp)).toBe(true);
  });

  it('tableau + stock together account for all 52 cards', () => {
    const tableauIds = tableau.flat().map(c => c.id);
    const stockIds = stock.map(c => c.id);
    const all = [...tableauIds, ...stockIds];
    expect(all).toHaveLength(52);
    expect(new Set(all).size).toBe(52);
  });

  it('does not mutate the input deck', () => {
    const deck = shuffle(createDeck());
    const snapshot = deck.map(c => c.id);
    dealKlondike(deck);
    expect(deck.map(c => c.id)).toEqual(snapshot);
    expect(deck).toHaveLength(52);
  });
});
