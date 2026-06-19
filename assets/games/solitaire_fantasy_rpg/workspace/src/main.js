import { RenderScene } from './engine/render-scene.js';
import { SolitaireCombat } from './systems/solitaire-combat.js';
import { AudioSystem } from './systems/audio.js';
import { HudView } from './ui/hud.js';
import { GAME_TEXT } from './content/game-text.js';
import { ENCOUNTER_BACKGROUNDS } from './content/backgrounds.js';

const canvas = document.getElementById('game-canvas');
const loading = document.getElementById('loading');
const startButton = document.getElementById('start-button');
const titleScreen = document.getElementById('title-screen');
const restartButton = document.getElementById('restart-button');

let renderScene;
let audio;
let combat;
let hud;
let running = false;

async function boot() {
  renderScene = new RenderScene(canvas);
  audio = new AudioSystem();
  combat = new SolitaireCombat({
    onChange: (state) => hud?.render(state),
    onDamage: (kind, amount, label) => {
      const targetKind = kind === 'enemyLimit' ? 'enemy' : kind;
      hud.damagePop(targetKind, amount, label);
      if (kind === 'hero') {
        renderScene.hit('hero');
        audio.play('enemy', 0.7);
      } else if (kind === 'enemyLimit') {
        renderScene.limitBurst();
        audio.play('limit', 0.75);
      } else {
        renderScene.hit('enemy');
        audio.play('hit', 0.65);
      }
    },
    onToast: (message) => hud?.toast(message),
    onGameOver: (title, body) => {
      hud.showGameOver(title, body);
      running = false;
    }
  });
  hud = new HudView(combat);

  try {
    await renderScene.load();
    loading.hidden = true;
    startButton.hidden = false;
  } catch (error) {
    console.error('Asset load failed', error);
    loading.textContent = 'Some remote art failed to load. Check your connection and refresh.';
  }
  animate();
}

async function startGame() {
  await audio.unlock();
  audio.play('ui', 0.45);
  titleScreen.hidden = true;
  hud.showBattle();
  combat.reset();
  running = true;
  const snap = combat.snapshot();
  renderScene.setBackground(ENCOUNTER_BACKGROUNDS[snap.encounter]);
  renderScene.setEnemyPortrait(snap.enemy.portrait);
  hud.toast(`Mission start: defeat the ${snap.enemy.name} with solitaire chains.`);
}

function restart() {
  audio.play('ui', 0.45);
  hud.hideGameOver();
  combat.reset();
  running = true;
  hud.showBattle();
  const snap = combat.snapshot();
  renderScene.setBackground(ENCOUNTER_BACKGROUNDS[snap.encounter]);
  renderScene.setEnemyPortrait(snap.enemy.portrait);
  hud.toast(`${GAME_TEXT.newRun} Facing: ${snap.enemy.name}.`);
}

function animate() {
  requestAnimationFrame(animate);
  renderScene.update();
}

window.addEventListener('keydown', (event) => {
  if (!running) return;
  if (event.key.toLowerCase() === 'd') combat.draw();
  if (event.key.toLowerCase() === 'a') combat.autoFoundation();
  if (event.key.toLowerCase() === 'l') combat.useLimit();
  if (event.key.toLowerCase() === 'h') {
    const hint = combat.hint();
    if (hint?.cardId) hud.pulseCard(hint.cardId);
  }
  if (event.key === 'Enter') combat.brace();
  if (event.key === 'Escape') combat.clearSelection();
});

startButton.addEventListener('click', startGame, { once: true });
restartButton.addEventListener('click', restart);
boot();

// Dev-only console helpers — stripped from production builds by Vite's tree-shaking.
if (import.meta.env.DEV) {
  window.__game = { get combat() { return combat; }, get renderScene() { return renderScene; } };
  console.info('[dev] window.__game.combat and window.__game.renderScene are available.');
}
