import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './entities/Player.js';
import { PixelRenderer } from './sprites/PixelRenderer.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
const input = new Input();
input.listen(window);

const player = new Player(canvas.width / 2, canvas.height / 2);

// Player의 render를 PixelRenderer로 덮어씌움
player.render = (ctx) => {
  PixelRenderer.drawPlayer(ctx, player.x, player.y, 2);
};

// 입력 → 속도 반영
const origUpdate = player.update.bind(player);
player.update = (dt) => {
  const { x, y } = input.getAxis();
  player.vx = x * player.speed;
  player.vy = y * player.speed;
  origUpdate(dt);
};

game.addEntity(player);
game.start();
