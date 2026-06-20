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
    const [backdrop] = await Promise.all([
      this.loadTexture(ASSETS.art.battleBackdrop, 'backdrop'),
      this.loadTexture(ASSETS.art.titleArt, 'title')
    ]);
    this.addBackdrop(backdrop);
    this.addCrystalField();
    return { backdrop };
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
   * Switch the visual theme: swaps the backdrop image, updates particle colors,
   * and adjusts the veil. Safe to call before load() completes — guards are in place.
   * Backdrop loads asynchronously; particles and veil update immediately.
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

    if (this.backdrop && theme.backdrop) {
      this.loadTexture(theme.backdrop, 'backdrop').then(tex => {
        this.backdrop.material.map = tex;
        this.backdrop.material.needsUpdate = true;
      });
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

  hit() {
    this.shake(0.16, 0.1);
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
