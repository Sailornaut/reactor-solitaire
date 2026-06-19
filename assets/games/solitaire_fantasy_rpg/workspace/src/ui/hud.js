import { SUIT_NAMES, GAME_TEXT } from '../content/game-text.js';

export class HudView {
  constructor(combat) {
    this.combat = combat;
    this.dom = {
      hud: document.getElementById('hud'),
      battle: document.getElementById('battle-ui'),
      tableau: document.getElementById('tableau'),
      foundations: document.getElementById('foundations'),
      drawPile: document.getElementById('draw-pile'),
      wastePile: document.getElementById('waste-pile'),
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
    document.getElementById('waste-pile').addEventListener('dblclick', (event) => {
      event.preventDefault();
      if (this.combat.selectWasteTop()) this.combat.playSelectedToFoundation();
    });
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
    this.renderPiles(state);
    this.dom.limitButton.disabled = state.hero.limit < 100 || state.phase !== 'playing';
  }

  renderPiles(state) {
    this.dom.drawPile.classList.toggle('empty', !state.stock.length);
    this.dom.stock.textContent = state.stock.length;

    const topWaste = state.waste[state.waste.length - 1];
    this.dom.waste.innerHTML = '';
    this.dom.wastePile.draggable = Boolean(topWaste);
    this.dom.wastePile.ondragstart = topWaste
      ? (event) => {
          event.dataTransfer.setData('text/plain', topWaste.id);
          event.dataTransfer.effectAllowed = 'move';
          this.combat.selectWasteTop(false);
          this.dom.wastePile.classList.add('dragging');
        }
      : null;
    this.dom.wastePile.ondragend = topWaste
      ? () => {
          this.dom.wastePile.classList.remove('dragging');
          this.bounceIfStillSelected();
        }
      : null;

    if (topWaste) {
      this.dom.waste.appendChild(this.createStaticCard(topWaste, 'pile-card'));
    } else {
      this.dom.waste.textContent = state.stock.length ? '—' : '↻';
    }
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
      if (top) {
        slot.appendChild(this.createStaticCard(top, 'foundation-card'));
        const label = document.createElement('small');
        label.textContent = SUIT_NAMES[suit];
        slot.appendChild(label);
      } else {
        slot.innerHTML = `<span>${suit}</span><small>A → K</small>`;
      }
      slot.addEventListener('click', () => this.combat.clickFoundation(suit));
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      });
      slot.addEventListener('drop', (event) => {
        event.preventDefault();
        if (!this.combat.clickFoundation(suit)) this.bounceSelected();
      });
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
      col.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      });
      col.addEventListener('drop', (event) => {
        event.preventDefault();
        if (!this.combat.moveSelectedToTableau(colIndex)) this.bounceSelected();
      });
      column.forEach((card, index) => {
        const node = this.createCard(card, state.selected, colIndex, index);
        node.style.top = `${index * offset}px`;
        node.style.zIndex = index + 1;
        node.addEventListener('click', (event) => {
          event.stopPropagation();
          this.combat.selectTableau(colIndex, index);
        });
        node.addEventListener('dblclick', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (this.combat.selectTableauStack(colIndex, index)) this.combat.playSelectedToFoundation();
        });
        node.addEventListener('dragstart', (event) => {
          event.stopPropagation();
          event.dataTransfer.setData('text/plain', card.id);
          event.dataTransfer.effectAllowed = 'move';
          this.combat.selectTableauStack(colIndex, index, false);
          node.classList.add('dragging');
        });
        node.addEventListener('dragend', () => {
          node.classList.remove('dragging');
          this.bounceIfStillSelected();
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
    node.draggable = card.faceUp;
    if (selected?.source === 'tableau' && selected.col === col && index >= selected.index) node.classList.add('selected');
    if (card.faceUp) {
      node.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;
      node.setAttribute('aria-label', `${card.rank} of ${SUIT_NAMES[card.suit]}`);
    } else {
      node.setAttribute('aria-label', GAME_TEXT.faceDownCard);
    }
    return node;
  }

  createStaticCard(card, extraClass = '') {
    const node = document.createElement('div');
    node.className = `card static-card ${extraClass} ${card.color === 'red' ? 'red' : 'black'}`;
    node.dataset.cardId = card.id;
    node.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;
    node.setAttribute('aria-label', `${card.rank} of ${SUIT_NAMES[card.suit]}`);
    return node;
  }

  bounceIfStillSelected() {
    requestAnimationFrame(() => {
      if (this.combat.snapshot().selected) this.bounceSelected();
    });
  }

  bounceSelected() {
    const selected = this.combat.snapshot().selected;
    if (!selected) return;

    for (const card of selected.cards) {
      const node = document.querySelector(`[data-card-id="${CSS.escape(card.id)}"]`);
      if (!node) continue;
      node.classList.remove('bounce-back');
      void node.offsetWidth;
      node.classList.add('bounce-back');
      setTimeout(() => node.classList.remove('bounce-back'), 260);
    }
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
