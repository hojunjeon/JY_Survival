import { CanvasUtil } from './Canvas.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entities = [];
    this.running = false;
    this._lastTime = 0;
    this._rafId = null;
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx > -1) this.entities.splice(idx, 1);
  }

  clearEntities() {
    this.entities = [];
  }

  update(dt) {
    for (const entity of this.entities) {
      entity.update(dt);
    }
  }

  render() {
    CanvasUtil.clear(this.ctx);
    for (const entity of this.entities) {
      entity.render(this.ctx);
    }
  }

  start() {
    this.running = true;
    this._lastTime = performance.now();
    this._loop(this._lastTime);
  }

  stop() {
    this.running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _loop(timestamp) {
    if (!this.running) return;
    const dt = Math.max(0.0001, Math.min((timestamp - this._lastTime) / 1000, 0.05));
    this._lastTime = timestamp;
    this.update(dt);
    this.render();
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }
}
