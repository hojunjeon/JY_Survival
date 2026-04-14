import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './entities/Player.js';
import { PixelRenderer } from './sprites/PixelRenderer.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { checkCollision } from './core/Collision.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
const input = new Input();
input.listen(window);

// 플레이어 생성
const playerRenderer = {
  draw(ctx, x, y) { PixelRenderer.drawPlayer(ctx, x, y, 2); },
};
const player = new Player(canvas.width / 2, canvas.height / 2, playerRenderer);

// 웨이브 시스템 (3초마다 스폰)
const waveSystem = new WaveSystem({
  spawnInterval: 3,
  canvasWidth: canvas.width,
  canvasHeight: canvas.height,
});

// 활성 적 목록
let enemies = [];

// Game.update 를 게임 로직으로 교체
game.update = (dt) => {
  // 1. 플레이어 입력 → 이동
  const { x, y } = input.getAxis();
  player.vx = x * player.speed;
  player.vy = y * player.speed;
  player.update(dt);

  // 2. 웨이브 스폰
  const newEnemies = waveSystem.update(dt);
  for (const e of newEnemies) {
    enemies.push(e);
    game.addEntity(e);
  }

  // 3. 적 이동 + 충돌 처리
  for (const enemy of enemies) {
    if (!enemy.isDead) {
      enemy.update(dt, player.x, player.y);

      // 플레이어 ↔ 적 충돌
      if (checkCollision(player, enemy)) {
        player.takeDamage(enemy.contactDamage);
        // 즉시 충돌 반복 방지: 적을 밀어냄
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * 16;
        enemy.y += (dy / len) * 16;
      }
    }
  }

  // 4. 죽은 적 제거 + HP 아이템 드롭
  const dead = enemies.filter(e => e.isDead);
  for (const e of dead) {
    if (e.dropsHpItem) {
      player.heal(20);
    }
    game.removeEntity(e);
  }
  enemies = enemies.filter(e => !e.isDead);
};

// Game.render 는 entities 를 순회하므로 player 를 entities 에 추가
game.addEntity(player);
game.start();
