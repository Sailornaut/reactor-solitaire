import { describe, expect, it } from 'vitest';
import { canMoveToFoundation, canPlaceOnTableau, isFoundationsComplete } from './solitaire-rules.js';

// Minimal card factories — only the fields each predicate inspects.
const card = (value, color, faceUp = true) => ({ value, color, faceUp });
const red  = (value, faceUp = true) => card(value, 'red',   faceUp);
const blk  = (value, faceUp = true) => card(value, 'black', faceUp);

// ── canPlaceOnTableau ─────────────────────────────────────────────────────────

describe('canPlaceOnTableau — occupied column', () => {
  it('accepts a red 6 on a face-up black 7', () => {
    expect(canPlaceOnTableau(red(6), blk(7))).toBe(true);
  });

  it('accepts a black 9 on a face-up red 10', () => {
    expect(canPlaceOnTableau(blk(9), red(10))).toBe(true);
  });

  it('rejects a card of the same color', () => {
    expect(canPlaceOnTableau(red(6), red(7))).toBe(false);
    expect(canPlaceOnTableau(blk(6), blk(7))).toBe(false);
  });

  it('rejects when the value gap is not exactly 1', () => {
    expect(canPlaceOnTableau(red(5), blk(7))).toBe(false); // gap of 2
    expect(canPlaceOnTableau(red(7), blk(7))).toBe(false); // same value
    expect(canPlaceOnTableau(red(8), blk(7))).toBe(false); // wrong direction
  });

  it('rejects when the target card is face-down', () => {
    expect(canPlaceOnTableau(red(6), blk(7, false))).toBe(false);
  });

  it('handles Ace (value 1) onto a face-up black 2', () => {
    expect(canPlaceOnTableau(red(1), blk(2))).toBe(true);
  });
});

describe('canPlaceOnTableau — empty column', () => {
  it('accepts a King (value 13) on null', () => {
    expect(canPlaceOnTableau(red(13), null)).toBe(true);
    expect(canPlaceOnTableau(blk(13), null)).toBe(true);
  });

  it('accepts a King on undefined', () => {
    expect(canPlaceOnTableau(red(13), undefined)).toBe(true);
  });

  it('rejects any non-King on an empty column', () => {
    for (let v = 1; v <= 12; v++) {
      expect(canPlaceOnTableau(red(v), null)).toBe(false);
      expect(canPlaceOnTableau(blk(v), null)).toBe(false);
    }
  });
});

// ── canMoveToFoundation ───────────────────────────────────────────────────────

describe('canMoveToFoundation', () => {
  it('accepts an Ace onto an empty foundation', () => {
    expect(canMoveToFoundation({ value: 1 }, [])).toBe(true);
  });

  it('accepts a Two onto a foundation containing only an Ace', () => {
    expect(canMoveToFoundation({ value: 2 }, [{}])).toBe(true);
  });

  it('accepts any card whose value is exactly stack.length + 1', () => {
    for (let len = 0; len < 13; len++) {
      const stack = Array(len).fill({});
      expect(canMoveToFoundation({ value: len + 1 }, stack)).toBe(true);
    }
  });

  it('rejects when value is too low', () => {
    expect(canMoveToFoundation({ value: 1 }, [{}])).toBe(false); // stack has 1 card, needs value 2
  });

  it('rejects when value is too high', () => {
    expect(canMoveToFoundation({ value: 3 }, [{}])).toBe(false); // stack has 1 card, needs value 2
  });

  it('rejects a King (13) unless foundation already has 12 cards', () => {
    expect(canMoveToFoundation({ value: 13 }, Array(11).fill({}))).toBe(false);
    expect(canMoveToFoundation({ value: 13 }, Array(12).fill({}))).toBe(true);
  });

  it('rejects a card played onto a complete foundation', () => {
    // Foundation already has 13 cards (K is the last); nothing more should go on
    expect(canMoveToFoundation({ value: 13 }, Array(13).fill({}))).toBe(false);
  });
});

// ── isFoundationsComplete ─────────────────────────────────────────────────────

describe('isFoundationsComplete', () => {
  const empty = () => ({ '♠': [], '♥': [], '♦': [], '♣': [] });
  const full13 = () => Array(13).fill({});

  it('returns false when all foundations are empty', () => {
    expect(isFoundationsComplete(empty())).toBe(false);
  });

  it('returns false when only one suit is complete', () => {
    const f = empty();
    f['♠'] = full13();
    expect(isFoundationsComplete(f)).toBe(false);
  });

  it('returns false when three suits are complete but one has 12 cards', () => {
    const f = { '♠': full13(), '♥': full13(), '♦': full13(), '♣': Array(12).fill({}) };
    expect(isFoundationsComplete(f)).toBe(false);
  });

  it('returns true when all four suits have exactly 13 cards', () => {
    const f = { '♠': full13(), '♥': full13(), '♦': full13(), '♣': full13() };
    expect(isFoundationsComplete(f)).toBe(true);
  });

  it('returns false when one suit has 14 cards (over-full edge case)', () => {
    const f = { '♠': Array(14).fill({}), '♥': full13(), '♦': full13(), '♣': full13() };
    expect(isFoundationsComplete(f)).toBe(false);
  });
});
