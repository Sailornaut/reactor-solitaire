import { createDeck, shuffle, dealKlondike } from './deck.js';
import { STARTING_ENEMY } from '../content/enemies.js';
import { ATTACKS } from '../content/attacks.js';
import { GAME_TEXT } from '../content/game-text.js';

export class SolitaireCombat {
  constructor({ onChange, onDamage, onToast, onGameOver }) {
    this.onChange = onChange;
    this.onDamage = onDamage;
    this.onToast = onToast;
    this.onGameOver = onGameOver;
    this.combo = 0;
    this.reset();
  }

  reset() {
    const { tableau, stock } = dealKlondike(shuffle(createDeck()));
    this.tableau = tableau;
    this.stock = stock;
    this.waste = [];
    this.foundations = { '♠': [], '♥': [], '♦': [], '♣': [] };
    this.selected = null;
    this.hero = { hp: 100, maxHp: 100, limit: 0 };
    this.enemy = { ...STARTING_ENEMY };
    this.turnsWithoutDamage = 0;
    this.moves = 0;
    this.combo = 0;
    this.phase = 'playing';
    this.emit();
  }

  draw() {
    if (this.phase !== 'playing') return;
    this.clearSelection();
    if (this.stock.length) {
      const card = this.stock.pop();
      card.faceUp = true;
      this.waste.push(card);
      this.hero.limit = Math.min(100, this.hero.limit + 2);
      this.onToast(GAME_TEXT.drawCard);
    } else if (this.waste.length) {
      this.stock = this.waste.reverse().map(c => ({ ...c, faceUp: false }));
      this.waste = [];
      this.enemyAttack(GAME_TEXT.reshufflePunish);
    }
    this.emit();
  }

  selectFromWaste() {
    if (!this.waste.length || this.phase !== 'playing') return;
    this.selected = { source: 'waste', card: this.waste[this.waste.length - 1], cards: [this.waste[this.waste.length - 1]] };
    this.emit();
  }

  selectTableau(col, index) {
    if (this.phase !== 'playing') return;
    const card = this.tableau[col][index];
    if (!card || !card.faceUp) return;
    const stack = this.tableau[col].slice(index);
    if (this.selected) {
      if (this.selected.source === 'tableau' && this.selected.col === col && this.selected.index === index) {
        this.clearSelection();
      } else if (this.moveSelectedToTableau(col)) {
        return;
      } else {
        this.selected = { source: 'tableau', col, index, card, cards: stack };
      }
    } else {
      this.selected = { source: 'tableau', col, index, card, cards: stack };
    }
    this.emit();
  }

  clickFoundation(suit) {
    if (this.phase !== 'playing') return;
    if (!this.selected) return;
    if (this.selected.cards.length > 1) {
      this.onToast(GAME_TEXT.foundationStackOnly);
      return;
    }
    const card = this.selected.card;
    if (card.suit !== suit || !this.canMoveToFoundation(card)) {
      this.onToast(GAME_TEXT.foundationOrder);
      return;
    }
    this.removeSelected();
    this.foundations[suit].push(card);
    this.afterPlayerDamage(8 + card.value, `Foundation ${card.rank}${card.suit}!`);
    this.revealTopCards();
    this.clearSelection(false);
    this.checkWin();
    this.emit();
  }

  autoFoundation() {
    if (this.phase !== 'playing') return;
    const candidates = [];
    const wasteTop = this.waste[this.waste.length - 1];
    if (wasteTop && this.canMoveToFoundation(wasteTop)) candidates.push({ source: 'waste', card: wasteTop });
    for (let col = 0; col < 7; col++) {
      const top = this.tableau[col][this.tableau[col].length - 1];
      if (top?.faceUp && this.canMoveToFoundation(top)) candidates.push({ source: 'tableau', col, index: this.tableau[col].length - 1, card: top });
    }
    if (!candidates.length) {
      this.onToast(GAME_TEXT.noFoundationMove);
      return;
    }
    const pick = candidates[0];
    this.selected = pick.source === 'waste'
      ? { source: 'waste', card: pick.card, cards: [pick.card] }
      : { source: 'tableau', col: pick.col, index: pick.index, card: pick.card, cards: [pick.card] };
    this.clickFoundation(pick.card.suit);
  }

  moveSelectedToTableau(targetCol) {
    if (!this.selected) return false;
    const moving = this.selected.cards;
    const first = moving[0];
    const dest = this.tableau[targetCol];
    const top = dest[dest.length - 1];
    const legal = top ? top.faceUp && top.color !== first.color && top.value === first.value + 1 : first.value === 13;
    if (!legal) {
      this.onToast(top ? GAME_TEXT.tableauRule : GAME_TEXT.kingOnly);
      return false;
    }
    this.removeSelected();
    dest.push(...moving);
    this.afterPlayerDamage(3 + moving.length * 2, moving.length > 1 ? `Chain moved x${moving.length}!` : GAME_TEXT.tacticalMove);
    this.revealTopCards();
    this.clearSelection(false);
    this.emit();
    return true;
  }

  removeSelected() {
    if (this.selected.source === 'waste') this.waste.pop();
    if (this.selected.source === 'tableau') this.tableau[this.selected.col].splice(this.selected.index);
  }

  canMoveToFoundation(card) {
    const stack = this.foundations[card.suit];
    return card.value === stack.length + 1;
  }

  revealTopCards() {
    for (const col of this.tableau) {
      const top = col[col.length - 1];
      if (top && !top.faceUp) {
        top.faceUp = true;
        this.hero.limit = Math.min(100, this.hero.limit + 5);
        this.onToast(`Revealed ${top.rank}${top.suit}. Surge +5%`);
      }
    }
  }

  afterPlayerDamage(amount, label) {
    this.moves++;
    this.combo++;
    const damage = amount + Math.min(14, this.combo * 2);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    this.hero.limit = Math.min(100, this.hero.limit + Math.ceil(damage * 0.45));
    this.turnsWithoutDamage = 0;
    this.onDamage('enemy', damage, label);
    if (this.enemy.hp <= 0) this.win(GAME_TEXT.enemyKilledByDamage);
  }

  enemyAttack(prefix = 'Enemy turn!') {
    if (this.phase !== 'playing') return;
    this.combo = 0;
    const damage = this.enemy.intent;
    this.hero.hp = Math.max(0, this.hero.hp - damage);
    this.hero.limit = Math.min(100, this.hero.limit + 10);
    this.enemy.intent = Math.min(24, this.enemy.intent + 2 + Math.floor(this.moves / 12));
    this.onDamage('hero', damage, `${prefix} -${damage} HP`);
    if (this.hero.hp <= 0) this.lose(GAME_TEXT.heroHpZero);
    this.emit();
  }

  brace() {
    if (this.phase !== 'playing') return;
    this.turnsWithoutDamage++;
    const reduced = Math.max(4, Math.floor(this.enemy.intent * 0.55));
    this.hero.hp = Math.max(0, this.hero.hp - reduced);
    this.hero.limit = Math.min(100, this.hero.limit + 14);
    this.combo = 0;
    this.onDamage('hero', reduced, `Braced: -${reduced} HP, Surge +14%`);
    if (this.hero.hp <= 0) this.lose(GAME_TEXT.braceLoss);
    this.emit();
  }

  useLimit() {
    if (this.phase !== 'playing' || this.hero.limit < 100) return;
    this.hero.limit = 0;
    const faceUp = this.tableau.flat().filter(c => c.faceUp).length;
    const damage = 42 + faceUp;
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    this.onDamage('enemyLimit', damage, ATTACKS.coreSurge.label);
    this.combo = 0;
    if (this.enemy.hp <= 0) this.win(ATTACKS.coreSurge.killMessage);
    this.emit();
  }

  hint() {
    const move = this.findHint();
    if (!move) {
      this.onToast(GAME_TEXT.noHint);
      return null;
    }
    this.onToast(move.text);
    return move;
  }

  findHint() {
    const wasteTop = this.waste[this.waste.length - 1];
    if (wasteTop && this.canMoveToFoundation(wasteTop)) return { type: 'waste-foundation', cardId: wasteTop.id, text: `Play ${wasteTop.rank}${wasteTop.suit} to foundation.` };
    for (let col = 0; col < 7; col++) {
      const top = this.tableau[col][this.tableau[col].length - 1];
      if (top?.faceUp && this.canMoveToFoundation(top)) return { type: 'tableau-foundation', cardId: top.id, text: `Channel ${top.rank}${top.suit} to foundation.` };
    }
    const sources = [];
    if (wasteTop) sources.push({ source: 'waste', card: wasteTop, cards: [wasteTop] });
    for (let col = 0; col < 7; col++) {
      this.tableau[col].forEach((card, index) => { if (card.faceUp) sources.push({ source: 'tableau', col, index, card, cards: this.tableau[col].slice(index) }); });
    }
    for (const src of sources) {
      for (let col = 0; col < 7; col++) {
        if (src.source === 'tableau' && src.col === col) continue;
        const dest = this.tableau[col];
        const top = dest[dest.length - 1];
        const legal = top ? top.faceUp && top.color !== src.card.color && top.value === src.card.value + 1 : src.card.value === 13;
        if (legal) return { type: 'tableau', cardId: src.card.id, targetCol: col, text: `Move ${src.card.rank}${src.card.suit} to column ${col + 1}.` };
      }
    }
    return null;
  }

  checkWin() {
    const complete = Object.values(this.foundations).every(stack => stack.length === 13);
    if (complete) this.win(GAME_TEXT.foundationsComplete);
  }

  win(body) {
    if (this.phase !== 'playing') return;
    this.phase = 'won';
    this.onGameOver('Mission Complete', body);
  }

  lose(body) {
    if (this.phase !== 'playing') return;
    this.phase = 'lost';
    this.onGameOver('Game Over', body);
  }

  clearSelection(emit = true) {
    this.selected = null;
    if (emit) this.emit();
  }

  emit() {
    this.onChange?.(this.snapshot());
  }

  snapshot() {
    return {
      tableau: this.tableau,
      stock: this.stock,
      waste: this.waste,
      foundations: this.foundations,
      selected: this.selected,
      hero: this.hero,
      enemy: this.enemy,
      phase: this.phase,
      moves: this.moves
    };
  }
}
