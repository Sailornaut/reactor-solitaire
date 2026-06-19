import { createDeck, shuffle, dealKlondike } from './deck.js';
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
import { canMoveToFoundation, canPlaceOnTableau, isFoundationsComplete } from './solitaire-rules.js';
import { GAME_TEXT } from '../content/game-text.js';
import { ENCOUNTER_ORDER } from '../content/enemies.js';

export class SolitaireCombat {
  constructor({ onChange, onDamage, onToast, onGameOver }) {
    this.onChange = onChange;
    this.onDamage = onDamage;
    this.onToast = onToast;
    this.onGameOver = onGameOver;
    this.combo = 0;
    // Tracks which enemy in ENCOUNTER_ORDER is active.
    // Advances on win; stays the same on loss so the player retries.
    this.encounterIndex = 0;
    this.reset();
  }

  reset() {
    const { tableau, stock } = dealKlondike(shuffle(createDeck()));
    this.tableau = tableau;
    this.stock = stock;
    this.waste = [];
    this.foundations = { '♠': [], '♥': [], '♦': [], '♣': [] };
    this.selected = null;
    this.hero = createHeroState();
    this.enemy = createEnemyState(ENCOUNTER_ORDER[this.encounterIndex]);
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
      gainDrawSurge(this.hero);
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

  selectWasteTop(emit = true) {
    if (!this.waste.length || this.phase !== 'playing') return false;
    this.selected = { source: 'waste', card: this.waste[this.waste.length - 1], cards: [this.waste[this.waste.length - 1]] };
    if (emit) this.emit();
    return true;
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

  selectTableauStack(col, index, emit = true) {
    if (this.phase !== 'playing') return false;
    const card = this.tableau[col][index];
    if (!card || !card.faceUp) return false;
    this.selected = { source: 'tableau', col, index, card, cards: this.tableau[col].slice(index) };
    if (emit) this.emit();
    return true;
  }

  clickFoundation(suit) {
    if (this.phase !== 'playing') return false;
    if (!this.selected) return false;
    if (this.selected.cards.length > 1) {
      this.onToast(GAME_TEXT.foundationStackOnly);
      return false;
    }
    const card = this.selected.card;
    if (card.suit !== suit || !canMoveToFoundation(card, this.foundations[card.suit])) {
      this.onToast(GAME_TEXT.foundationOrder);
      return false;
    }
    this.removeSelected();
    this.foundations[suit].push(card);
    this.afterPlayerDamage(8 + card.value, `Foundation ${card.rank}${card.suit}!`);
    this.revealTopCards();
    this.clearSelection(false);
    this.checkWin();
    this.emit();
    return true;
  }

  playSelectedToFoundation() {
    if (this.phase !== 'playing' || !this.selected) return false;
    if (this.selected.cards.length > 1) {
      this.onToast(GAME_TEXT.foundationStackOnly);
      return false;
    }

    const card = this.selected.card;
    if (!canMoveToFoundation(card, this.foundations[card.suit])) {
      this.onToast(GAME_TEXT.foundationOrder);
      return false;
    }

    this.clickFoundation(card.suit);
    return true;
  }

  autoFoundation() {
    if (this.phase !== 'playing') return;
    const candidates = [];
    const wasteTop = this.waste[this.waste.length - 1];
    if (wasteTop && canMoveToFoundation(wasteTop, this.foundations[wasteTop.suit])) candidates.push({ source: 'waste', card: wasteTop });
    for (let col = 0; col < 7; col++) {
      const top = this.tableau[col][this.tableau[col].length - 1];
      if (top?.faceUp && canMoveToFoundation(top, this.foundations[top.suit])) candidates.push({ source: 'tableau', col, index: this.tableau[col].length - 1, card: top });
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
    const legal = canPlaceOnTableau(first, top);
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

  revealTopCards() {
    for (const col of this.tableau) {
      const top = col[col.length - 1];
      if (top && !top.faceUp) {
        top.faceUp = true;
        gainRevealSurge(this.hero);
        this.onToast(`Revealed ${top.rank}${top.suit}. Surge +5%`);
      }
    }
  }

  afterPlayerDamage(amount, label) {
    this.moves++;
    const result = applyPlayerDamage(this.hero, this.enemy, amount, this.combo);
    this.combo = result.combo;
    this.turnsWithoutDamage = 0;
    this.onDamage('enemy', result.damage, label);
    if (result.enemyDefeated) this.win(result.winMessage);
  }

  enemyAttack(prefix = 'Enemy turn!') {
    if (this.phase !== 'playing') return;
    this.combo = 0;
    const result = applyEnemyAttack(this.hero, this.enemy, this.moves);
    this.onDamage('hero', result.damage, `${prefix} -${result.damage} HP`);
    if (result.heroDefeated) this.lose(result.lossMessage);
    this.emit();
  }

  brace() {
    if (this.phase !== 'playing') return;
    this.turnsWithoutDamage++;
    const result = applyBrace(this.hero, this.enemy);
    this.combo = 0;
    this.onDamage('hero', result.damage, `Braced: -${result.damage} HP, Surge +14%`);
    if (result.heroDefeated) this.lose(result.lossMessage);
    this.emit();
  }

  useLimit() {
    if (this.phase !== 'playing' || this.hero.limit < 100) return;
    const faceUp = this.tableau.flat().filter(c => c.faceUp).length;
    const result = activateCoreSurge(this.hero, this.enemy, faceUp);
    this.onDamage('enemyLimit', result.damage, result.label);
    this.combo = 0;
    if (result.enemyDefeated) this.win(result.winMessage);
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
    if (wasteTop && canMoveToFoundation(wasteTop, this.foundations[wasteTop.suit])) return { type: 'waste-foundation', cardId: wasteTop.id, text: `Play ${wasteTop.rank}${wasteTop.suit} to foundation.` };
    for (let col = 0; col < 7; col++) {
      const top = this.tableau[col][this.tableau[col].length - 1];
      if (top?.faceUp && canMoveToFoundation(top, this.foundations[top.suit])) return { type: 'tableau-foundation', cardId: top.id, text: `Channel ${top.rank}${top.suit} to foundation.` };
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
        const legal = canPlaceOnTableau(src.card, top);
        if (legal) return { type: 'tableau', cardId: src.card.id, targetCol: col, text: `Move ${src.card.rank}${src.card.suit} to column ${col + 1}.` };
      }
    }
    return null;
  }

  checkWin() {
    if (isFoundationsComplete(this.foundations)) this.win(GAME_TEXT.foundationsComplete);
  }

  win(body) {
    if (this.phase !== 'playing') return;
    this.phase = 'won';
    // Advance to the next encounter; wrap around after the final boss.
    this.encounterIndex = (this.encounterIndex + 1) % ENCOUNTER_ORDER.length;
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
      moves: this.moves,
      encounter: this.encounterIndex,
    };
  }
}
