export class Input {
  constructor() {
    this._keys = new Set();
  }

  onKeyDown(event) {
    this._keys.add(event.code);
  }

  onKeyUp(event) {
    this._keys.delete(event.code);
  }

  isDown(code) {
    return this._keys.has(code);
  }

  getAxis() {
    let x = 0;
    let y = 0;

    if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft'))  x -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown'))  y += 1;
    if (this.isDown('KeyW') || this.isDown('ArrowUp'))    y -= 1;

    const len = Math.sqrt(x * x + y * y);
    if (len > 0) {
      x /= len;
      y /= len;
    }

    return { x, y };
  }

  listen(target = window) {
    this._target = target;
    this._boundDown = e => this.onKeyDown(e);
    this._boundUp   = e => this.onKeyUp(e);
    target.addEventListener('keydown', this._boundDown);
    target.addEventListener('keyup',   this._boundUp);
  }

  unlisten() {
    if (this._target) {
      this._target.removeEventListener('keydown', this._boundDown);
      this._target.removeEventListener('keyup',   this._boundUp);
      this._target = null;
    }
  }
}
