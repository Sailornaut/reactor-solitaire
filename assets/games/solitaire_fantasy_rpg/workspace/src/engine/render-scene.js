import * as THREE from 'three';
import { ASSETS } from '../config/assets.js';
import { BACKGROUNDS } from '../content/backgrounds.js';

export class RenderScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.z = 10;
    this.clock = new THREE.Clock();
    this.cards = [];
    this.particles = [];
    this.shakeTime = 0;
    this.shakePower = 0;
    this.textureLoader = new THREE.TextureLoader();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  async load() {
    document.documentElement.style.setProperty('--title-art', `url(${ASSETS.art.titleArt})`);
    const [backdrop, hero, enemy, title] = await Promise.all([
      this.loadTexture(ASSETS.art.battleBackdrop, 'backdrop'),
      this.loadTexture(ASSETS.art.heroPortrait, 'hero'),
      this.loadTexture(ASSETS.art.enemyPortrait, 'enemy'),
      this.loadTexture(ASSETS.art.titleArt, 'title')
    ]);
    this.addBackdrop(backdrop);
    this.hero = this.addPortrait(hero, -4.0, -0.25, 2.65, 'hero');
    this.enemy = this.addPortrait(enemy, 4.0, -0.2, 2.75, 'enemy');
    this.addCrystalField();
    return { backdrop, hero, enemy, title };
  }

  loadTexture(url, kind = 'asset') {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (texture) => {
        if (settled) return;
        settled = true;
        resolve(texture);
      };
      const timer = setTimeout(() => {
        finish(this.createFallbackTexture(kind));
      }, 4500);
      this.textureLoader.load(url, (tex) => {
        clearTimeout(timer);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        finish(tex);
      }, undefined, () => {
        clearTimeout(timer);
        finish(this.createFallbackTexture(kind));
      });
    });
  }

  createFallbackTexture(kind) {
    const canvas = document.createElement('canvas');
    canvas.width = kind === 'backdrop' || kind === 'title' ? 1024 : 512;
    canvas.height = kind === 'backdrop' || kind === 'title' ? 576 : 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#071126');
    gradient.addColorStop(0.5, kind === 'enemy' ? '#4b1028' : '#13216b');
    gradient.addColorStop(1, '#080712');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = kind === 'enemy' ? '#ff4fa3' : '#60f7ff';
    ctx.lineWidth = 8;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.font = `800 ${Math.floor(canvas.width / 18)}px system-ui`;
    ctx.fillText(kind === 'enemy' ? 'REACTOR WRAITH' : kind === 'hero' ? 'MERC HERO' : 'REACTOR DISTRICT', 42, canvas.height - 60);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  addBackdrop(texture) {
    const geo = new THREE.PlaneGeometry(16, 9);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    this.backdrop = new THREE.Mesh(geo, mat);
    this.backdrop.position.z = -4;
    this.scene.add(this.backdrop);
    this.veil = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ color: 0x050812, transparent: true, opacity: 0.28 }));
    this.veil.position.z = -3.9;
    this.scene.add(this.veil);
  }

  addPortrait(texture, x, y, h, kind) {
    const geo = new THREE.PlaneGeometry(h, h);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, -1.8);
    mesh.userData.baseX = x;
    mesh.userData.baseY = y;
    mesh.userData.kind = kind;
    this.scene.add(mesh);

    const ring = new THREE.Mesh(new THREE.RingGeometry(h * 0.52, h * 0.57, 64), new THREE.MeshBasicMaterial({ color: kind === 'hero' ? 0x60f7ff : 0xff4fa3, transparent: true, opacity: 0.52, side: THREE.DoubleSide }));
    ring.position.set(x, y, -1.9);
    this.scene.add(ring);
    mesh.userData.ring = ring;
    return mesh;
  }

  addCrystalField() {
    const mat = new THREE.MeshBasicMaterial({ color: 0x60f7ff, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 48; i++) {
      const s = 0.012 + Math.random() * 0.04;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 6), mat.clone());
      mesh.position.set((Math.random() - 0.5) * 13, (Math.random() - 0.5) * 7.2, -2.4 + Math.random() * 0.8);
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.userData.speed = 0.15 + Math.random() * 0.55;
      this.scene.add(mesh);
      this.particles.push(mesh);
    }
  }

  /**
   * Switch the visual theme by updating particle colors and the veil.
   * The backdrop texture (remote art or procedural fallback) is not replaced so
   * the first-encounter look is preserved exactly.
   * Safe to call before load() completes — guards are in place.
   */
  setBackground(key) {
    const theme = BACKGROUNDS[key];
    if (!theme) return;

    if (this.veil) {
      this.veil.material.color.set(theme.veilColor);
      this.veil.material.opacity = theme.veilOpacity;
    }

    const color = new THREE.Color(theme.particleColor);
    for (const p of this.particles) {
      if (!p.userData.decay) {
        p.material.color.set(color);
      }
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const viewH = 9;
    this.camera.left = -viewH * aspect / 2;
    this.camera.right = viewH * aspect / 2;
    this.camera.top = viewH / 2;
    this.camera.bottom = -viewH / 2;
    this.camera.updateProjectionMatrix();
  }

  hit(kind) {
    const target = kind === 'enemy' ? this.enemy : this.hero;
    if (!target) return;
    const dir = kind === 'enemy' ? 1 : -1;
    target.position.x = target.userData.baseX + dir * 0.18;
    target.scale.set(1.08, 1.08, 1);
    this.shake(0.16, kind === 'enemy' ? 0.08 : 0.12);
    setTimeout(() => {
      target.position.x = target.userData.baseX;
      target.scale.set(1, 1, 1);
    }, 120);
  }

  limitBurst() {
    this.shake(0.5, 0.16);
    for (let i = 0; i < 28; i++) {
      const slash = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 2.5 + Math.random() * 2), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd86b : 0x60f7ff, transparent: true, opacity: 0.85 }));
      slash.position.set(1.2 + Math.random() * 5, -1.5 + Math.random() * 3, 1);
      slash.rotation.z = -0.9 + Math.random() * 0.4;
      slash.userData.life = 0.45 + Math.random() * 0.2;
      slash.userData.decay = true;
      this.scene.add(slash);
      this.particles.push(slash);
    }
  }

  shake(duration, power) {
    this.shakeTime = Math.max(this.shakeTime, duration);
    this.shakePower = Math.max(this.shakePower, power);
  }

  update() {
    const dt = Math.min(this.clock.getDelta(), 0.033);
    const t = performance.now() * 0.001;
    if (this.hero) {
      this.hero.position.y = this.hero.userData.baseY + Math.sin(t * 1.8) * 0.035;
      this.hero.userData.ring.rotation.z += dt * 0.5;
    }
    if (this.enemy) {
      this.enemy.position.y = this.enemy.userData.baseY + Math.cos(t * 1.6) * 0.04;
      this.enemy.userData.ring.rotation.z -= dt * 0.45;
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.userData.decay) {
        p.userData.life -= dt;
        p.material.opacity = Math.max(0, p.userData.life * 1.8);
        p.position.x -= dt * 5;
        if (p.userData.life <= 0) {
          this.scene.remove(p);
          this.particles.splice(i, 1);
        }
      } else {
        p.position.y += dt * p.userData.speed;
        p.rotation.z += dt * 0.25;
        if (p.position.y > 4.8) p.position.y = -4.8;
      }
    }
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      this.camera.position.x = (Math.random() - 0.5) * this.shakePower;
      this.camera.position.y = (Math.random() - 0.5) * this.shakePower;
      if (this.shakeTime <= 0) {
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.shakePower = 0;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
