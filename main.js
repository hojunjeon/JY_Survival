import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './entities/Player.js';
import { PixelRenderer } from './sprites/PixelRenderer.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { checkCollision } from './core/Collision.js';
import { WeaponMenu } from './ui/Menu.js';
import { Boss } from './entities/Boss.js';
import { Projectile } from './entities/Projectile.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const game = new Game(canvas);
const input = new Input();
input.listen(window);

// ─── 상태 관리 ──────────────────────────────────────────────────────────────
let state = 'menu'; // 'menu' | 'playing' | 'stage_clear'
let selectedWeapon = null;

// ─── 메뉴 ────────────────────────────────────────────────────────────────────
const weaponMenu = new WeaponMenu();

function renderMenu() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('김지윤의 디버그 서바이벌', canvas.width / 2, 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.fillText('무기를 선택하세요 (1 / 2 / 3)', canvas.width / 2, 145);

  const options = weaponMenu.getOptions();
  const colors = ['#4caf50', '#f44336', '#ff9800'];
  const descs = [
    '360° 자동 투사체  |  범위 ↑  속도 ↓',
    '전방 고속 관통탄  |  속도 ↑  데미지 ↑',
    '오비탈 오브 3개  |  자동 접촉 공격',
  ];

  options.forEach((opt, i) => {
    const y = 220 + i * 90;
    ctx.fillStyle = colors[i];
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`[${i + 1}]  ${opt.name}`, canvas.width / 2, y);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px monospace';
    ctx.fillText(descs[i], canvas.width / 2, y + 28);
  });
}

// 메뉴 키 입력
function handleMenuKey(e) {
  const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
  if (idx === undefined) return;
  selectedWeapon = weaponMenu.select(idx);
  window.removeEventListener('keydown', handleMenuKey);
  startGame();
}
window.addEventListener('keydown', handleMenuKey);

// 메뉴 루프
function menuLoop() {
  if (state !== 'menu') return;
  renderMenu();
  requestAnimationFrame(menuLoop);
}
menuLoop();

// ─── 게임 시작 ───────────────────────────────────────────────────────────────
function startGame() {
  state = 'playing';

  const playerRenderer = {
    draw(ctx, x, y) { PixelRenderer.drawPlayer(ctx, x, y, 2); },
  };
  const player = new Player(canvas.width / 2, canvas.height / 2, playerRenderer);

  const waveSystem = new WaveSystem({
    spawnInterval: 3,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });

  const eventSystem = new EventSystem();

  let enemies = [];
  let projectiles = [];
  let boss = null;
  let bossProjectiles = [];
  let bossDialogue = null;
  let bossDialogueTimer = 0;
  let stageClearDialogue = null;

  const canvasBounds = { width: canvas.width, height: canvas.height };

  // ── 무기별 자동 발사 로직 ────────────────────────────────────────────────
  function tryFireWeapon(weapon, player) {
    if (!weapon) return;

    // Java 오비탈은 fire() 없음 — update에서 자동 처리
    if (weapon.name === 'Java') return;

    if (!weapon.canFire()) return;

    let dirX = player.lastDirX;
    let dirY = player.lastDirY;

    // Python은 방향 무관 (360°), C는 lastDir 사용
    const newProjs = weapon.fire(player.x, player.y, dirX, dirY);
    for (const p of newProjs) {
      projectiles.push(p);
      game.addEntity(p);
    }
  }

  // ── Game.update 오버라이드 ───────────────────────────────────────────────
  game.update = (dt) => {
    // 1. 플레이어 입력 → 이동
    const { x, y } = input.getAxis();
    player.vx = x * player.speed;
    player.vy = y * player.speed;
    player.update(dt);

    // 2. 무기 업데이트 + 자동 발사
    if (selectedWeapon) {
      selectedWeapon.update(dt);
      tryFireWeapon(selectedWeapon, player);
    }

    // 3. 투사체 업데이트 + 범위 이탈 제거
    for (const proj of projectiles) {
      if (proj.active) proj.update(dt, canvasBounds);
    }

    // 4. 웨이브 스폰 (보스 등장 전까지만)
    if (!boss) {
      const newEnemies = waveSystem.update(dt);
      for (const e of newEnemies) {
        enemies.push(e);
        game.addEntity(e);
      }
    }

    // 5. 이벤트 시스템 업데이트
    const eventNotifications = eventSystem.update(dt);
    for (const n of eventNotifications) {
      if (n.type === 'boss_triggered' && !boss) {
        // 보스 등장 — 적 전체 제거
        for (const e of enemies) game.removeEntity(e);
        enemies = [];

        boss = new Boss(canvas.width / 2, 80);
        game.addEntity(boss);
        bossDialogue = boss.getDialogue('appear');
        bossDialogueTimer = 3;
      }
    }

    // 5-1. 적 킬 이벤트 시스템 통보 (죽은 적 처리 직전)
    // (아래 9번에서 처리)

    // 6. 적 이동
    for (const enemy of enemies) {
      if (!enemy.isDead) {
        enemy.update(dt, player.x, player.y);
      }
    }

    // 7. 보스 업데이트
    if (boss && !boss.isDead) {
      const phaseChanged = boss.updatePhase();
      if (phaseChanged) {
        bossDialogue = boss.getDialogue('phase2');
        bossDialogueTimer = 3;
      }

      boss.update(dt, player.x, player.y);

      // 보스 투사체 발사
      const newBossProjs = boss.shoot(player.x, player.y);
      for (const pd of newBossProjs) {
        const p = new Projectile(pd.x, pd.y, pd.vx, pd.vy, pd.damage);
        p._isBossProjectile = true;
        bossProjectiles.push(p);
        game.addEntity(p);
      }

      // 보스 대사 타이머
      if (bossDialogueTimer > 0) {
        bossDialogueTimer -= dt;
        if (bossDialogueTimer <= 0) bossDialogue = null;
      }
    }

    // 8. 투사체 업데이트
    for (const proj of [...projectiles, ...bossProjectiles]) {
      if (proj.active) proj.update(dt, canvasBounds);
    }

    // 9. 투사체 ↔ 적 충돌
    for (const proj of projectiles) {
      if (!proj.active) continue;
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        if (checkCollision(proj, enemy)) {
          enemy.takeDamage(proj.damage);
          if (!proj.piercing) { proj.deactivate(); break; }
        }
      }
    }

    // 10. 투사체 ↔ 보스 충돌
    if (boss && !boss.isDead) {
      for (const proj of projectiles) {
        if (!proj.active) continue;
        if (checkCollision(proj, boss)) {
          boss.takeDamage(proj.damage);
          if (!proj.piercing) proj.deactivate();
          if (boss.isDead) {
            bossDialogue = boss.getDialogue('death');
            bossDialogueTimer = 4;
            const killNotifs = eventSystem.notifyBossKill();
            for (const n of killNotifs) {
              if (n.type === 'stage_clear') {
                setTimeout(() => {
                  state = 'stage_clear';
                  stageClearDialogue = bossDialogue;
                  game.stop();
                  renderStageClear();
                }, 3000);
              }
            }
          }
        }
      }
    }

    // 11. Java 오비탈 ↔ 적 충돌
    if (selectedWeapon && selectedWeapon.name === 'Java') {
      const orbPositions = selectedWeapon.getOrbPositions(player.x, player.y);
      orbPositions.forEach((orb, orbIdx) => {
        for (const enemy of enemies) {
          if (enemy.isDead) continue;
          if (checkCollision(orb, enemy)) {
            if (selectedWeapon.tryHit(orbIdx, enemy)) {
              enemy.takeDamage(orb.damage);
            }
          }
        }
      });
    }

    // 12. 보스 투사체 ↔ 플레이어 충돌
    for (const proj of bossProjectiles) {
      if (!proj.active) continue;
      if (checkCollision(proj, player)) {
        player.takeDamage(proj.damage);
        proj.deactivate();
      }
    }

    // 13. 플레이어 ↔ 적 충돌
    for (const enemy of enemies) {
      if (!enemy.isDead && checkCollision(player, enemy)) {
        player.takeDamageFromContact(enemy.contactDamage);
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * 16;
        enemy.y += (dy / len) * 16;
      }
    }

    // 14. 플레이어 ↔ 보스 접촉 데미지
    if (boss && !boss.isDead && checkCollision(player, boss)) {
      player.takeDamage(20);
    }

    // 15. 죽은 적 제거 + HP 드롭 + 이벤트 통보
    const dead = enemies.filter(e => e.isDead);
    for (const e of dead) {
      if (e.dropsHpItem) player.heal(20);
      eventSystem.notifyKill(e.type);
      game.removeEntity(e);
    }
    enemies = enemies.filter(e => !e.isDead);

    // 16. 비활성 투사체 제거
    const deadProjs = projectiles.filter(p => !p.active);
    for (const p of deadProjs) game.removeEntity(p);
    projectiles = projectiles.filter(p => p.active);

    const deadBossProjs = bossProjectiles.filter(p => !p.active);
    for (const p of deadBossProjs) game.removeEntity(p);
    bossProjectiles = bossProjectiles.filter(p => p.active);
  };

  // ── Game.render에 HUD + 오비탈 추가 ────────────────────────────────────
  const originalRender = game.render.bind(game);
  game.render = () => {
    originalRender();

    // Java 오비탈 렌더
    if (selectedWeapon && selectedWeapon.name === 'Java') {
      const orbPositions = selectedWeapon.getOrbPositions(player.x, player.y);
      orbPositions.forEach(orb => {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // HUD: HP
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${player.hp} / ${player.maxHp}`, 12, 20);

    // HUD: 무기명
    if (selectedWeapon) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#4fc3f7';
      ctx.fillText(`무기: ${selectedWeapon.name}`, canvas.width - 12, 20);
    }

    // HUD: 보스 HP 바
    if (boss) {
      const barW = 300;
      const barH = 16;
      const barX = (canvas.width - barW) / 2;
      const barY = 12;
      const ratio = Math.max(0, boss.hp / boss.maxHp);

      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = boss.phase === 2 ? '#cc0066' : '#990099';
      ctx.fillRect(barX, barY, barW * ratio, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`장선형 ${boss.phase === 2 ? '[2페이즈]' : ''}  ${boss.hp} / ${boss.maxHp}`, canvas.width / 2, barY + barH + 14);
    }

    // 보스 대사 말풍선
    if (bossDialogue && boss) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(20, canvas.height - 70, canvas.width - 40, 50);
      ctx.strokeStyle = '#cc0066';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, canvas.height - 70, canvas.width - 40, 50);
      ctx.fillStyle = '#ffccee';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`장선형: "${bossDialogue}"`, canvas.width / 2, canvas.height - 40);
    }

    ctx.textAlign = 'left';
  };

  game.addEntity(player);
  game.start();
}

// ─── 스테이지 클리어 화면 ─────────────────────────────────────────────────────
function renderStageClear() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STAGE CLEAR!', canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = '#ffccee';
  ctx.font = '15px monospace';
  ctx.fillText('장선형: "말도 안 돼... 이건 진짜 억울하다고요!!"', canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = '#4fc3f7';
  ctx.font = '14px monospace';
  ctx.fillText('보상: 강화 재화 획득 + 무기 획득!', canvas.width / 2, canvas.height / 2 + 30);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '13px monospace';
  ctx.fillText('[ 새로고침으로 다시 시작 ]', canvas.width / 2, canvas.height / 2 + 80);

  ctx.textAlign = 'left';
}
