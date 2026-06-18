import { SUIT_NAMES, GAME_TEXT } from '../content/game-text.js';

export class HudView {
  constructor(combat) {
    this.combat = combat;
    this.dom = {
      hud: document.getElementById('hud'),
      battle: document.getElementById('battle-ui'),
      tableau: document.getElementById('tableau'),
      foundations: document.getElementById('foundations'),
      stock: document.getElementById('stock-count'),
      waste: document.getElementById('waste-card'),
      heroHp: document.getElementById('hero-hp'),
      heroHpBar: document.getElementById('hero-hp-bar'),
      enemyName: document.getElementById('enemy-name'),
      enemyHp: document.getElementById('enemy-hp'),
      enemyHpBar: document.getElementById('enemy-hp-bar'),
      enemyIntent: document.getElementById('enemy-intent'),
      limitText: document.getElementById('limit-text'),
      limitBar: document.getElementById('limit-bar'),
      limitButton: document.getElementById('limit-button'),
      messagePanel: document.getElementById('message-panel'),
      messageTitle: document.getElementById('message-title'),
      messageBody: document.getElementById('message-body'),
      toast: document.getElementById('toast')
    };
    this.bindStatic();
  }

  bindStatic() {
    document.getElementById('draw-pile').addEventListener('click', () => this.combat.draw());
    document.getElementById('waste-pile').addEventListener('click', () => this.combat.selectFromWaste());
    document.getElementById('auto-button').addEventListener('click', () => this.combat.autoFoundation());
    document.getElementById('end-turn-button').addEventListener('click', () => this.combat.brace());
    document.getElementById('limit-button').addEventListener('click', () => this.combat.useLimit());
    document.getElementById('hint-button').addEventListener('click', () => {
      const hint = this.combat.hint();
      if (hint?.cardId) this.pulseCard(hint.cardId);
    });
  }

  showBattle() {
    this.dom.hud.hidden = false;
    this.dom.battle.hidden = false;
  }

  render(state) {
    this.renderBars(state);
    this.renderFoundations(state);
    this.renderTableau(state);
    this.dom.stock.textContent = state.stock.length;
    const topWaste = state.waste[state.waste.length - 1];
    this.dom.waste.textContent = topWaste ? `${topWaste.rank}${topWaste.suit}` : (state.stock.length ? '—' : '↻');
    this.dom.limitButton.disabled = state.hero.limit < 100 || state.phase !== 'playing';
  }

  renderBars(state) {
    this.dom.enemyName.textContent = state.enemy.name;
    this.dom.heroHp.textContent = `HP ${state.hero.hp}/${state.hero.maxHp}`;
    this.dom.heroHpBar.style.width = `${Math.max(0, state.hero.hp / state.hero.maxHp * 100)}%`;
    this.dom.enemyHp.textContent = `HP ${state.enemy.hp}/${state.enemy.maxHp}`;
    this.dom.enemyHpBar.style.width = `${Math.max(0, state.enemy.hp / state.enemy.maxHp * 100)}%`;
    this.dom.enemyIntent.textContent = `Intent: ${state.enemy.intent} damage`;
    this.dom.limitText.textContent = `Surge ${state.hero.limit}%`;
    this.dom.limitBar.style.width = `${state.hero.limit}%`;
  }

  renderFoundations(state) {
    this.dom.foundations.innerHTML = '';
    for (const suit of ['♠','♥','♦','♣']) {
      const slot = document.createElement('button');
      slot.className = 'foundation-slot';
      slot.dataset.suit = suit;
      const top = state.foundations[suit][state.foundations[suit].length - 1];
      slot.innerHTML = top ? `<span>${top.rank}${top.suit}</span><small>${SUIT_NAMES[suit]}</small>` : `<span>${suit}</span><small>A → K</small>`;
      slot.addEventListener('click', () => this.combat.clickFoundation(suit));
      this.dom.foundations.appendChild(slot);
    }
  }

  renderTableau(state) {
    this.dom.tableau.innerHTML = '';
    const mobile = window.innerWidth < 760;
    const offset = mobile ? 28 : 38;
    state.tableau.forEach((column, colIndex) => {
      const col = document.createElement('div');
      col.className = 'tableau-column';
      col.dataset.col = colIndex;
      col.addEventListener('click', (event) => {
        if (event.target === col) this.combat.moveSelectedToTableau(colIndex);
      });
      column.forEach((card, index) => {
        const node = this.createCard(card, state.selected, colIndex, index);
        node.style.top = `${index * offset}px`;
        node.style.zIndex = index + 1;
        node.addEventListener('click', (event) => {
          event.stopPropagation();
          this.combat.selectTableau(colIndex, index);
        });
        col.appendChild(node);
      });
      this.dom.tableau.appendChild(col);
    });
  }

  createCard(card, selected, col, index) {
    const node = document.createElement('button');
    node.className = `card ${card.color === 'red' ? 'red' : 'black'} ${card.faceUp ? '' : 'face-down'}`;
    node.dataset.cardId = card.id;
    if (selected?.source === 'tableau' && selected.col === col && index >= selected.index) node.classList.add('selected');
    if (card.faceUp) {
      node.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;
      node.setAttribute('aria-label', `${card.rank} of ${SUIT_NAMES[card.suit]}`);
    } else {
      node.setAttribute('aria-label', GAME_TEXT.faceDownCard);
    }
    return node;
  }

  toast(message) {
    clearTimeout(this.toastTimer);
    this.dom.toast.textContent = message;
    this.dom.toast.classList.add('show');
    this.toastTimer = setTimeout(() => this.dom.toast.classList.remove('show'), 1700);
  }

  damagePop(kind, amount, label) {
    const pop = document.createElement('div');
    pop.className = 'damage-pop';
    pop.textContent = kind === 'hero' ? `-${amount}` : `${amount}!`;
    pop.style.left = kind === 'hero' ? '25%' : '74%';
    pop.style.top = kind === 'hero' ? '38%' : '35%';
    document.getElementById('fx-layer').appendChild(pop);
    setTimeout(() => pop.remove(), 900);
    this.toast(label);
    const target = kind === 'hero' ? document.querySelector('.status-card.hero') : document.querySelector('.status-card.enemy');
    target?.classList.add(kind === 'hero' ? 'flash-red' : 'flash-cyan');
    setTimeout(() => target?.classList.remove('flash-red', 'flash-cyan'), 320);
    document.getElementById('battle-ui')?.classList.add('shake');
    setTimeout(() => document.getElementById('battle-ui')?.classList.remove('shake'), 260);
  }

  showGameOver(title, body) {
    this.dom.messageTitle.textContent = title;
    this.dom.messageBody.textContent = body;
    this.dom.messagePanel.hidden = false;
  }

  hideGameOver() {
    this.dom.messagePanel.hidden = true;
  }

  pulseCard(cardId) {
    const node = document.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`);
    node?.classList.add('hint');
    setTimeout(() => node?.classList.remove('hint'), 1700);
  }
}
