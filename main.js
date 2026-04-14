import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './entities/Player.js';
import { PixelRenderer } from './sprites/PixelRenderer.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
const input = new Input();
input.listen(window);

// renderer DI: PixelRenderer를 주입하면 Player.render()가 스프라이트로 그린다
const playerRenderer = {
  draw(ctx, x, y) {
    PixelRenderer.drawPlayer(ctx, x, y, 2);
  },
};

const player = new Player(canvas.width / 2, canvas.height / 2, playerRenderer);

// 매 프레임: 입력 → 속도 반영
const origUpdate = player.update.bind(player);
player.update = (dt) => {
  const { x, y } = input.getAxis();
  player.vx = x * player.speed;
  player.vy = y * player.speed;
  origUpdate(dt);
};

game.addEntity(player);
game.start();
