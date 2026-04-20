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
import { EventModal } from './ui/EventModal.js';
import { HUD } from './ui/HUD.js';
import { FloatingTextManager } from './ui/FloatingText.js';
import { GitWeapon } from './weapons/Git.js';
import { SQLWeapon } from './weapons/SQL.js';
import { JavaScriptWeapon } from './weapons/JavaScript.js';
import { DjangoWeapon } from './weapons/Django.js';
import { LinuxBashWeapon } from './weapons/LinuxBash.js';
import { PythonWeapon } from './weapons/Python.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const game = new Game(canvas);
const input = new Input();
input.listen(window);

// ─── 상태 관리 ──────────────────────────────────────────────────────────────
let state = 'intro'; // 'intro' | 'menu' | 'playing' | 'game_over' | 'stage_clear'
let selectedWeapon = null;

// ─── 인트로 화면 ──────────────────────────────────────────────────────────────
function renderIntro() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 타이틀
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('김지윤의 디버그 서바이벌', canvas.width / 2, 80);

  // 부제
  ctx.fillStyle = '#888888';
  ctx.font = '13px monospace';
  ctx.fillText('— 버그들을 처치하고 SSAFY를 구하라 —', canvas.width / 2, 110);

  // 스토리
  ctx.fillStyle = '#cccccc';
  ctx.font = '14px monospace';
  const story = [
    'SSAFY 6반, 오후 11시.',
    '동기들의 에러 메시지가 카톡으로 쏟아진다.',
    '지윤 씨, 오늘도 버그 처치에 나선다.',
  ];
  story.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 175 + i * 26);
  });

  // 구분선
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 270); ctx.lineTo(canvas.width - 80, 270);
  ctx.stroke();

  // 조작법
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('조작법', canvas.width / 2, 298);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '13px monospace';
  const controls = [
    'WASD / 방향키   이동',
    '자동 공격       무기가 자동으로 발사됩니다',
    'Space           이벤트 알림 닫기',
    'R               게임 오버 후 재시작',
  ];
  controls.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 322 + i * 22);
  });

  // 목표
  ctx.fillStyle = '#4caf50';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('목표: 버그를 처치하고 이벤트를 클리어하여 보스 장선형을 쓰러트려라!', canvas.width / 2, 430);

  // 시작 힌트
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  ctx.fillStyle = blink ? '#ffffff' : '#666666';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('[ Space ] 시작', canvas.width / 2, 490);

  ctx.textAlign = 'left';
}

function handleIntroKey(e) {
  if (e.key === ' ' || e.key === 'Enter') {
    window.removeEventListener('keydown', handleIntroKey);
    state = 'menu';
    menuLoop();
  }
}
window.addEventListener('keydown', handleIntroKey);

function introLoop() {
  if (state !== 'intro') return;
  renderIntro();
  requestAnimationFrame(introLoop);
}
introLoop();

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
  if (state !== 'menu') return;
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

// ─── 게임 시작 ───────────────────────────────────────────────────────────────
function startGame() {
  game.clearEntities();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state = 'playing';

  const playerRenderer = {
    draw(ctx, x, y) { PixelRenderer.drawPlayer(ctx, x, y, 2); },
    drawWithOutline(ctx, x, y) { PixelRenderer.drawPlayerWithOutline(ctx, x, y, 2); },
  };
  const player = new Player(canvas.width / 2, canvas.height / 2, playerRenderer);
  // 컨트롤 반전 효과 초기화
  player.controlsReversed = false;
  player.controlsReversedTimer = 0;

  const hud = new HUD({ canvasWidth: canvas.width, canvasHeight: canvas.height });
  const floatingTextManager = new FloatingTextManager();

  const waveSystem = new WaveSystem({
    spawnInterval: 3,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });

  const eventSystem = new EventSystem();

  const eventModal = new EventModal({ canvasWidth: canvas.width, canvasHeight: canvas.height });
  let paused = false;

  const WORLD_W = 2000;
  const WORLD_H = 2000;

  let enemies = [];
  let projectiles = [];
  let boss = null;
  let bossProjectiles = [];
  let bossDialogue = null;
  let bossDialogueTimer = 0;
  let garbageObjects = [];
  let codeWalls = []; // 초기화
  let stageClearDialogue = null;

  // ─── Screen Shake 상태 ──────────────────────────────────────────────────
  let screenShake = { intensity: 0, duration: 0 };

  function triggerScreenShake(intensity, duration) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
    screenShake.duration = Math.max(screenShake.duration, duration);
  }

  const REWARD_WEAPON_POOL = [
    GitWeapon, SQLWeapon, JavaScriptWeapon, DjangoWeapon, LinuxBashWeapon,
  ];
  const availableRewards = [...REWARD_WEAPON_POOL];
  let ownedWeapons = [selectedWeapon];
  let rewardNotice = null;
  let rewardNoticeTimer = 0;

  function giveRewardWeapon() {
    if (availableRewards.length === 0) return;
    const idx = Math.floor(Math.random() * availableRewards.length);
    const WeaponClass = availableRewards.splice(idx, 1)[0];
    const weapon = new WeaponClass();
    if (ownedWeapons.length < 4) ownedWeapons.push(weapon);
    rewardNotice = `무기 획득: ${weapon.name}`;
    rewardNoticeTimer = 3;
  }

  const worldBounds = { width: WORLD_W, height: WORLD_H };

  // ── 무기별 자동 발사 로직 ────────────────────────────────────────────────
  function tryFireWeapon(weapon, player) {
    if (!weapon) return;

    // Git Branch & Merge — merge 실행
    if (weapon.name === 'Git' && weapon.mergeReady) {
      const bp = weapon.consumeMerge();
      if (bp) {
        // 직선 위 적 탐색 (선분과 점 거리 계산)
        const lineX1 = bp.x, lineY1 = bp.y;
        const lineX2 = player.x, lineY2 = player.y;
        const lineLenSq = (lineX2 - lineX1) ** 2 + (lineY2 - lineY1) ** 2;
        const allMergeTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
        let hitCount = 0;
        for (const e of allMergeTargets) {
          if (e.isDead) continue;
          let dist;
          if (lineLenSq === 0) {
            dist = Math.sqrt((e.x - lineX1) ** 2 + (e.y - lineY1) ** 2);
          } else {
            const t = Math.max(0, Math.min(1,
              ((e.x - lineX1) * (lineX2 - lineX1) + (e.y - lineY1) * (lineY2 - lineY1)) / lineLenSq
            ));
            const closestX = lineX1 + t * (lineX2 - lineX1);
            const closestY = lineY1 + t * (lineY2 - lineY1);
            dist = Math.sqrt((e.x - closestX) ** 2 + (e.y - closestY) ** 2);
          }
          if (dist <= 60) {
            e.takeDamage(weapon.damage);
            hitCount++;
          }
        }
        if (hitCount > 0) {
          triggerScreenShake(4, 0.2);
          floatingTextManager.add('Merge Conflict Resolved!', player.x, player.y - 30, '#f05033');
        }
      }
      return;
    }

    // SQL DROP TABLE — 발동
    if (weapon.name === 'SQL' && weapon.canFire()) {
      // 가장 가까운 적 탐색
      let nearestTarget = null;
      let nearestDist = Infinity;
      const sqlTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
      for (const e of sqlTargets) {
        if (e.isDead) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) { nearestDist = dist; nearestTarget = e; }
      }
      const tx = nearestTarget ? nearestTarget.x : player.x + player.lastDirX * 150;
      const ty = nearestTarget ? nearestTarget.y : player.y + player.lastDirY * 150;
      weapon.startDrop(tx, ty);
      return;
    }

    // JavaScript Tornado — 발동
    if (weapon.name === 'JavaScript' && weapon.canFire()) {
      weapon.startTornado(player.x, player.y);
      return;
    }

    // Java 블랙홀 소환
    if (weapon.name === 'Java' && weapon._pendingBlackhole) {
      weapon._pendingBlackhole = false;
      // 가장 가까운 적 탐색
      let nearestEnemy = null;
      let nearestDist = Infinity;
      const allTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
      for (const e of allTargets) {
        if (e.isDead) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) { nearestDist = dist; nearestEnemy = e; }
      }
      if (nearestEnemy) {
        const bh = new Projectile(nearestEnemy.x, nearestEnemy.y, 0, 0, 30, {
          isBlackhole: true,
          blackholeRadius: 120,
          blackholeLifetime: 2.0,
          color: '#220044',
        });
        projectiles.push(bh);
        game.addEntity(bh);
      }
    }

    // Java 오비탈은 fire() 없음 — update에서 자동 처리
    if (weapon.name === 'Java') return;

    if (!weapon.canFire()) return;

    const dirX = player.lastDirX;
    const dirY = player.lastDirY;

    const newProjs = weapon.fire(player.x, player.y, dirX, dirY);
    for (const p of newProjs) {
      // LinuxBash: 모든 적 즉시 데미지
      if (p.isAllEnemy) {
        for (const enemy of enemies) {
          if (!enemy.isDead) {
            enemy.takeDamage(p.damage);
            triggerScreenShake(3, 0.1);
          }
        }
        if (boss && !boss.isDead) {
          boss.takeDamage(p.damage);
          triggerScreenShake(6, 0.15);
        }
        continue;
      }
      projectiles.push(p);
      game.addEntity(p);
      if (weapon.name === 'C/C++') {
        triggerScreenShake(5, 0.15);
      }
    }
  }

  function handleGameKey(e) {
    if (e.key === ' ' && eventModal.visible) {
      eventModal.hide();
      paused = false;
    }
    if ((e.key === 'r' || e.key === 'R') && state === 'game_over') {
      window.removeEventListener('keydown', handleGameKey);
      startGame();
    }
  }
  window.addEventListener('keydown', handleGameKey);

  // ── Game.update 오버라이드 ───────────────────────────────────────────────
  game.update = (dt) => {
    if (paused) return;

    // FloatingText 업데이트
    floatingTextManager.update(dt);

    // Screen Shake 감쇠
    if (screenShake.duration > 0) {
      screenShake.duration -= dt;
      if (screenShake.duration <= 0) {
        screenShake.intensity = 0;
        screenShake.duration = 0;
      }
    }

    // 사망 감지
    if (player.isDead) {
      state = 'game_over';
      game.stop();
      gameOverLoop();
      return;
    }

    // 1. 플레이어 입력 → 이동
    let { x, y } = input.getAxis();
    // 컨트롤 반전 효과 적용
    if (player.controlsReversed && player.controlsReversedTimer > 0) {
      x = -x;
      y = -y;
    }
    // 코드 벽이 5개 이상이면 이동 완전 금지
    if (codeWalls.length >= 5) {
      player.vx = 0;
      player.vy = 0;
    } else {
      player.vx = x * player.speed;
      player.vy = y * player.speed;
    }
    // 컨트롤 반전 타이머 업데이트
    if (player.controlsReversedTimer && player.controlsReversedTimer > 0) {
      player.controlsReversedTimer -= dt;
      if (player.controlsReversedTimer <= 0) {
        player.controlsReversed = false;
        player.controlsReversedTimer = 0;
      }
    }
    player.update(dt);
    // 월드 경계 클램핑
    player.x = Math.max(player.width / 2, Math.min(WORLD_W - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(WORLD_H - player.height / 2, player.y));

    // 2. 무기 업데이트 + 자동 발사
    for (const weapon of ownedWeapons) {
      if (weapon.name !== 'Java') weapon.update(dt);
      tryFireWeapon(weapon, player);
    }
    const javaWeapon = ownedWeapons.find(w => w.name === 'Java');
    if (javaWeapon) javaWeapon.update(dt);

    // 3. 투사체 업데이트 + 범위 이탈 제거
    for (const proj of projectiles) {
      if (proj.active) proj.update(dt, worldBounds);
    }

    // 3-1. 블랙홀 흡입 + 폭발 처리
    for (const proj of projectiles) {
      if (!proj.active || !proj.isBlackhole) continue;
      proj._bhTimer -= dt;

      // 주변 적 흡입
      const allBhTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
      for (const e of allBhTargets) {
        if (e.isDead) continue;
        const dx = proj.x - e.x;
        const dy = proj.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < proj.blackholeRadius) {
          const pull = 60 * dt;
          e.x += (dx / dist) * pull;
          e.y += (dy / dist) * pull;
        }
      }

      // 수명 종료 → 폭발
      if (proj._bhTimer <= 0) {
        for (const e of allBhTargets) {
          if (e.isDead) continue;
          const dx = e.x - proj.x;
          const dy = e.y - proj.y;
          if (Math.sqrt(dx * dx + dy * dy) <= proj.blackholeRadius) {
            e.takeDamage(proj.damage);
          }
        }
        triggerScreenShake(6, 0.2);
        floatingTextManager.add('GC!', proj.x, proj.y, '#aa44ff');
        proj.deactivate();
      }
    }

    // SQL 착지 폭발
    const sqlWeapon2 = ownedWeapons.find(w => w.name === 'SQL');
    if (sqlWeapon2 && sqlWeapon2.dropPhase === 'landed' && sqlWeapon2.phaseTimer > 0.35) {
      // phaseTimer가 0.4에서 막 시작됐을 때 한 번만 실행
      const sqlTargets2 = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
      for (const e of sqlTargets2) {
        if (e.isDead) continue;
        const dx = e.x - sqlWeapon2.targetX;
        const dy = e.y - sqlWeapon2.targetY;
        if (Math.sqrt(dx * dx + dy * dy) <= 120) {
          e.takeDamage(sqlWeapon2.damage);
        }
      }
      triggerScreenShake(8, 0.3);
      floatingTextManager.add('DROP TABLE!', sqlWeapon2.targetX, sqlWeapon2.targetY - 20, '#4499ff');
      sqlWeapon2.phaseTimer = 0.34; // 다음 프레임에 재실행 방지
    }

    // JavaScript 토네이도 데미지
    const jsWeapon = ownedWeapons.find(w => w.name === 'JavaScript');
    if (jsWeapon && jsWeapon.tornado && jsWeapon.tornado._pendingDmg) {
      jsWeapon.tornado._pendingDmg = false;
      const t = jsWeapon.tornado;
      const tornadoTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
      for (const e of tornadoTargets) {
        if (e.isDead) continue;
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        if (Math.sqrt(dx * dx + dy * dy) <= t.radius) {
          e.takeDamage(jsWeapon.damage);
          triggerScreenShake(1, 0.05);
        }
      }
    }

    // 4. 웨이브 스폰 (보스 등장 전까지만)
    if (!boss) {
      const newEnemies = waveSystem.update(dt, player.x, player.y);
      for (const e of newEnemies) {
        // memory_leak 제한: 이미 2마리 이상이면 스킵
        if (e.type === 'memory_leak') {
          const memoryLeakCount = enemies.filter(en => en.type === 'memory_leak').length;
          if (memoryLeakCount >= 2) continue;
        }
        // infinite_loop 제한: 이미 2마리 이상이면 스킵
        if (e.type === 'infinite_loop') {
          const infiniteLoopCount = enemies.filter(en => en.type === 'infinite_loop').length;
          if (infiniteLoopCount >= 2) continue;
        }
        // library_dependency 제한: 이미 1마리 이상이면 스킵
        if (e.type === 'library_dependency') {
          const libraryDependencyCount = enemies.filter(en => en.type === 'library_dependency').length;
          if (libraryDependencyCount >= 1) continue;
        }
        enemies.push(e);
        game.addEntity(e);
      }
    }

    // 5. 이벤트 시스템 업데이트
    const eventNotifications = eventSystem.update(dt);
    for (const n of eventNotifications) {
      if (n.type === 'event_triggered') {
        eventModal.show('triggered', n.event);
        paused = true;
        // 기존 몹 전부 제거
        for (const e of enemies) game.removeEntity(e);
        enemies = [];
        // 이벤트 모드 진입
        if (n.event === 'E1') waveSystem.setEventMode('indentation_error', 15);
        if (n.event === 'E2') waveSystem.setEventMode('env_error', Infinity);
      }
      if (n.type === 'event_cleared') {
        eventModal.show('cleared', n.event);
        paused = true;
        waveSystem.clearEventMode();
        // 이벤트 몹 전부 제거
        enemies = enemies.filter(e => {
          if (e.type === 'indentation_error' || e.type === 'env_error') {
            game.removeEntity(e);
            return false;
          }
          return true;
        });
        if (n.event === 'E2') giveRewardWeapon();
      }
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

    // 6. 적 이동 + 특수 공격 투사체 수집 + 가비지 수집
    for (const enemy of enemies) {
      if (!enemy.isDead) {
        enemy.update(dt, player.x, player.y);
        // 이벤트 몹 특수 공격 투사체 수집
        const shots = enemy.getAndClearPendingShots();
        for (const s of shots) {
          // infinite_loop: 코드 벽 투사체 처리
          if (s.isCodeWallProjectile) {
            const p = new Projectile(s.x, s.y, s.vx, s.vy, s.damage);
            p.isCodeWallProjectile = true;
            p.ownerEnemy = s.ownerEnemy;
            projectiles.push(p);
            game.addEntity(p);
          } else if (s.isControlReversal) {
            const p = new Projectile(s.x, s.y, s.vx, s.vy, s.damage);
            p.isControlReversal = true;
            p._isBossProjectile = true; // 플레이어 피격 처리 재활용
            bossProjectiles.push(p);
            game.addEntity(p);
          } else {
            const p = new Projectile(s.x, s.y, s.vx, s.vy, s.damage);
            p._isBossProjectile = true; // 플레이어 피격 처리 재활용
            bossProjectiles.push(p);
            game.addEntity(p);
          }
        }
        // memory_leak 가비지 수집
        if (enemy.type === 'memory_leak') {
          const garbage = enemy.getAndClearPendingGarbage();
          for (const g of garbage) {
            garbageObjects.push(g);
          }
        }
      }
    }

    // 6.5. library_dependency 버프 계산
    const pkgEnemies = enemies.filter(e => !e.isDead && e.type === 'library_dependency');
    const _radiusSq = 150 * 150;
    for (const e of enemies) {
      if (e.isDead || e.type === 'library_dependency') {
        e._isBuffed = false;
        continue;
      }
      e._isBuffed = pkgEnemies.some(pkg => {
        const dx = e.x - pkg.x;
        const dy = e.y - pkg.y;
        return (dx * dx + dy * dy) <= _radiusSq;
      });
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

    // 8. 투사체 업데이트 + homing 처리
    for (const proj of [...projectiles, ...bossProjectiles]) {
      if (proj.active) proj.update(dt, worldBounds);
    }

    // 8-1. homing 투사체 유도 처리
    for (const proj of projectiles) {
      if (!proj.active || !proj.homing) continue;

      // 가장 가까운 적 찾기
      let closestEnemy = null;
      let closestDist = Infinity;
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const dx = enemy.x - proj.x;
        const dy = enemy.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      // 보스도 추적 대상
      if (boss && !boss.isDead) {
        const dx = boss.x - proj.x;
        const dy = boss.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = boss;
        }
      }

      // 적이 있으면 유도
      if (closestEnemy) {
        const dx = closestEnemy.x - proj.x;
        const dy = closestEnemy.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(proj.vy, proj.vx);

        // 현재 각도에서 목표 각도로 최대 3rad/s 회전
        const maxRotation = 3 * dt;
        let angleDiff = targetAngle - currentAngle;

        // 각도 정규화 (-π ~ π)
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        const rotation = Math.max(-maxRotation, Math.min(maxRotation, angleDiff));
        const newAngle = currentAngle + rotation;
        const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);

        proj.vx = Math.cos(newAngle) * speed;
        proj.vy = Math.sin(newAngle) * speed;
      }
    }

    // 9. 투사체 ↔ 적 충돌 + 코드 벽 생성 처리
    for (const proj of projectiles) {
      if (!proj.active) continue;

      // infinite_loop: 코드 벽 투사체 → 플레이어 주변에 벽 생성
      if (proj.isCodeWallProjectile) {
        const dx = player.x - proj.x;
        const dy = player.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 40) {
          // 코드 벽 생성
          const wall = {
            x: proj.x,
            y: proj.y,
            width: 32,
            height: 32,
            ownerEnemy: proj.ownerEnemy,
          };
          codeWalls.push(wall);
          proj.ownerEnemy.codeWalls.push(wall);
          proj.deactivate();
        }
        continue;
      }

      // piercing: 중복 피격 방지 Set
      if (!proj.hitEnemies) proj.hitEnemies = new Set();

      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        if (checkCollision(proj, enemy)) {
          // piercing이면 적 ID 추적하여 중복 피격 방지
          if (proj.piercing) {
            if (!proj.hitEnemies.has(enemy)) {
              let dmg = proj.damage;
              // library_dependency 버프: 받는 데미지를 20%로 감소 (5배 방어력)
              if (enemy._isBuffed) dmg = Math.max(1, Math.floor(dmg * 0.2));
              enemy.takeDamage(dmg);
              triggerScreenShake(3, 0.1);
              proj.hitEnemies.add(enemy);
            }
          } else {
            let dmg = proj.damage;
            // library_dependency 버프: 받는 데미지를 20%로 감소 (5배 방어력)
            if (enemy._isBuffed) dmg = Math.max(1, Math.floor(dmg * 0.2));
            enemy.takeDamage(dmg);
            triggerScreenShake(3, 0.1);

            // Chain Lightning 체이닝
            if (proj.chainHops > 0 && proj.chainRadius > 0) {
              if (!proj.hitEnemyIds) proj.hitEnemyIds = new Set();
              proj.hitEnemyIds.add(enemy);

              // 범위 내 미방문 적 탐색
              let nearestEnemy = null;
              let nearestDist = Infinity;
              for (const e of enemies) {
                if (e.isDead || proj.hitEnemyIds.has(e)) continue;
                const dx = e.x - proj.x;
                const dy = e.y - proj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < proj.chainRadius && dist < nearestDist) {
                  nearestDist = dist;
                  nearestEnemy = e;
                }
              }
              if (nearestEnemy) {
                const dx = nearestEnemy.x - proj.x;
                const dy = nearestEnemy.y - proj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const chainProj = new Projectile(proj.x, proj.y, (dx/dist)*200, (dy/dist)*200, proj.damage, {
                  color: '#44ff44',
                  chainHops: proj.chainHops - 1,
                  chainRadius: proj.chainRadius,
                  hitEnemyIds: new Set(proj.hitEnemyIds),
                });
                chainProj.width = 6;
                chainProj.height = 6;
                projectiles.push(chainProj);
                game.addEntity(chainProj);
              }
            }

            proj.deactivate();
            break;
          }
        }
      }
    }

    // 10. 투사체 ↔ 보스 충돌
    if (boss && !boss.isDead) {
      for (const proj of projectiles) {
        if (!proj.active) continue;
        if (checkCollision(proj, boss)) {
          // piercing: 중복 피격 방지
          if (proj.piercing) {
            if (!proj.hitEnemies) proj.hitEnemies = new Set();
            if (!proj.hitEnemies.has(boss)) {
              boss.takeDamage(proj.damage);
              triggerScreenShake(6, 0.15);
              proj.hitEnemies.add(boss);
            }
          } else {
            boss.takeDamage(proj.damage);
            triggerScreenShake(6, 0.15);
            proj.deactivate();
          }

          if (boss.isDead) {
            bossDialogue = boss.getDialogue('death');
            bossDialogueTimer = 4;
            giveRewardWeapon();
            // 보스 처치 플로팅 텍스트
            floatingTextManager.add('BOSS DEFEATED!', canvas.width / 2, canvas.height / 2, '#ffd700');
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
              triggerScreenShake(3, 0.1);
            }
          }
        }
      });
    }

    // 12. 보스 투사체 ↔ 플레이어 충돌
    for (const proj of bossProjectiles) {
      if (!proj.active) continue;
      if (checkCollision(proj, player)) {
        if (proj.isControlReversal) {
          player.controlsReversed = true;
          player.controlsReversedTimer = 3.0;
        } else {
          player.takeDamage(proj.damage);
        }
        proj.deactivate();
      }
    }

    // 12-1. 가비지 타이머 업데이트
    for (let i = garbageObjects.length - 1; i >= 0; i--) {
      garbageObjects[i].timer -= dt;
      if (garbageObjects[i].timer <= 0) {
        garbageObjects.splice(i, 1);
      }
    }

    // 12-2. 플레이어 ↔ 가비지 충돌 (반경 16px)
    for (const garbage of garbageObjects) {
      const dx = garbage.x - player.x;
      const dy = garbage.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 16) {
        player.takeDamageFromContact(5);
        // 속도 감소 (중복 적용 방지)
        if (!player._speedDebuffTimer || player._speedDebuffTimer <= 0) {
          player._originalSpeed = player.speed;
          player.speed *= 0.5;
          player._speedDebuffTimer = 1.0;
        }
      }
    }

    // 12-3. 플레이어 속도 debuff 업데이트
    if (player._speedDebuffTimer && player._speedDebuffTimer > 0) {
      player._speedDebuffTimer -= dt;
      if (player._speedDebuffTimer <= 0) {
        player.speed = player._originalSpeed;
      }
    }

    // 12-4. 코드 벽 타이머 & 플레이어 충돌 처리
    let isMovementFrozen = false;
    let codeWallDamageThisFrame = 0;
    if (codeWalls.length > 0) {
      // 벽이 5개 이상이면 이동 완전 금지
      if (codeWalls.length >= 5) {
        isMovementFrozen = true;
      }
      // 각 벽과의 충돌 체크
      for (const wall of codeWalls) {
        const dx = wall.x - player.x;
        const dy = wall.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 벽 크기 16px (radius)
        if (dist <= 16 + 16) { // 플레이어 16px + 벽 16px
          // 슬로우 적용: 70% 감속 = 속도 0.3배
          if (!player._codeWallDebuffTimer || player._codeWallDebuffTimer <= 0) {
            player._originalCodeWallSpeed = player.speed;
            player.speed *= 0.3;
            player._codeWallDebuffTimer = 0.5;
          }
          // 매 틱마다 3 데미지
          codeWallDamageThisFrame += 3 * dt;
        }
      }
    }

    // 코드 벽 슬로우 업데이트
    if (player._codeWallDebuffTimer && player._codeWallDebuffTimer > 0) {
      player._codeWallDebuffTimer -= dt;
      if (player._codeWallDebuffTimer <= 0) {
        player.speed = player._originalCodeWallSpeed;
      }
    }

    // 누적된 코드 벽 데미지 적용
    if (codeWallDamageThisFrame > 0) {
      player.takeDamageFromContact(codeWallDamageThisFrame);
    }

    // 13. 플레이어 ↔ 적 충돌
    for (const enemy of enemies) {
      if (!enemy.isDead && checkCollision(player, enemy)) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        player.takeDamageFromContact(enemy.contactDamage);
        player.applyKnockback(dx, dy, 70);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * 16;
        enemy.y += (dy / len) * 16;
      }
    }

    // 14. 플레이어 ↔ 보스 접촉 데미지
    if (boss && !boss.isDead && checkCollision(player, boss)) {
      player.takeDamage(20);
    }

    // 15. 죽은 적 제거 + HP 드롭 + 이벤트 통보 + 코드 벽 제거
    const dead = enemies.filter(e => e.isDead);
    for (const e of dead) {
      // infinite_loop 적 사망 시 소유한 모든 코드 벽 제거
      if (e.type === 'infinite_loop' && e.codeWalls && e.codeWalls.length > 0) {
        const wallSet = new Set(e.codeWalls);
        codeWalls = codeWalls.filter(w => !wallSet.has(w));
        e.codeWalls = [];
      }
      if (e.dropsHpItem) player.heal(20);
      // 플로팅 텍스트 이펙트
      const floatingTexts = ['Bug Fixed!', 'Error Resolved!'];
      const randomText = floatingTexts[Math.floor(Math.random() * floatingTexts.length)];
      floatingTextManager.add(randomText, e.x, e.y, '#ffffff');
      const killNotifs = eventSystem.notifyKill(e.type);
      for (const n of killNotifs) {
        if (n.type === 'event_cleared') {
          eventModal.show('cleared', n.event);
          paused = true;
          waveSystem.clearEventEnemyType();
        }
      }
      game.removeEntity(e);
    }
    enemies = enemies.filter(e => !e.isDead);

    // 15-1. 무기 획득 알림 타이머
    if (rewardNoticeTimer > 0) {
      rewardNoticeTimer -= dt;
      if (rewardNoticeTimer <= 0) rewardNotice = null;
    }

    // 16. 비활성 투사체 처리 + 지역 효과
    const deadProjs = projectiles.filter(p => !p.active);
    for (const p of deadProjs) {
      // Git: 지역 효과 처리 (투사체 만료 또는 충돌 시)
      if (p.isAreaEffect && p.areaRadius > 0) {
        for (const enemy of enemies) {
          if (!enemy.isDead) {
            const dx = enemy.x - p.x;
            const dy = enemy.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) <= p.areaRadius) {
              enemy.takeDamage(p.damage);
              triggerScreenShake(3, 0.1);
            }
          }
        }
        if (boss && !boss.isDead) {
          const dx = boss.x - p.x;
          const dy = boss.y - p.y;
          if (Math.sqrt(dx * dx + dy * dy) <= p.areaRadius) {
            boss.takeDamage(p.damage);
            triggerScreenShake(6, 0.15);
          }
        }
      }
      game.removeEntity(p);
    }
    projectiles = projectiles.filter(p => p.active);

    const deadBossProjs = bossProjectiles.filter(p => !p.active);
    for (const p of deadBossProjs) game.removeEntity(p);
    bossProjectiles = bossProjectiles.filter(p => p.active);
  };

  // ── Game.render에 HUD + 오비탈 추가 ────────────────────────────────────
  game.render = () => {
    // 카메라 위치 계산 (플레이어 중심, 월드 경계 내 클램프)
    const camX = Math.max(0, Math.min(WORLD_W - canvas.width,  player.x - canvas.width  / 2));
    const camY = Math.max(0, Math.min(WORLD_H - canvas.height, player.y - canvas.height / 2));

    // 배경 클리어
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── 월드 공간 ──────────────────────────────────────────────────
    ctx.save();

    // Screen Shake 적용
    if (screenShake.duration > 0) {
      const ratio = screenShake.duration;
      const dx = (Math.random() - 0.5) * 2 * screenShake.intensity * ratio;
      const dy = (Math.random() - 0.5) * 2 * screenShake.intensity * ratio;
      ctx.translate(dx, dy);
    }

    ctx.translate(-camX, -camY);

    // 그리드 배경 (뷰포트 범위만 그림)
    const GRID = 64;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const startGridX = Math.floor(camX / GRID) * GRID;
    const startGridY = Math.floor(camY / GRID) * GRID;
    for (let x = startGridX; x < camX + canvas.width + GRID; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + canvas.height); ctx.stroke();
    }
    for (let y = startGridY; y < camY + canvas.height + GRID; y += GRID) {
      ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + canvas.width, y); ctx.stroke();
    }

    // 엔티티 렌더 (월드 좌표)
    for (const entity of game.entities) {
      entity.render(ctx);
    }

    // 코드 벽 렌더 (월드 좌표)
    for (const wall of codeWalls) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 51, 0, 0.7)';
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.fillRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);
      ctx.strokeRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);
      ctx.fillStyle = '#00ff00';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('{ }', wall.x, wall.y);
      ctx.restore();
    }

    // Java 오비탈 렌더 (월드 좌표)
    if (selectedWeapon && selectedWeapon.name === 'Java') {
      const orbPositions = selectedWeapon.getOrbPositions(player.x, player.y);
      orbPositions.forEach((orb, idx) => {
        const orbColor = selectedWeapon.orbs[idx].color;
        ctx.fillStyle = orbColor;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 블랙홀 렌더
    for (const proj of projectiles) {
      if (!proj.active || !proj.isBlackhole) continue;
      const ratio = proj._bhTimer / proj.blackholeLifetime;
      const radius = 8 + (1 - ratio) * 20;
      ctx.save();
      // 외곽 보라 테두리
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.blackholeRadius * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(170, 68, 255, ${0.3 + ratio * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // 검은 원
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#110022';
      ctx.fill();
      ctx.restore();
    }

    // C/C++ 조준선 렌더
    const cWeapon = ownedWeapons.find(w => w.name === 'C/C++');
    if (cWeapon) {
      const aimX = player.lastDirX || 0;
      const aimY = player.lastDirY || 0;
      if (aimX !== 0 || aimY !== 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + aimX * 400, player.y + aimY * 400);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Git Branch 포인트 렌더
    const gitWeapon = ownedWeapons.find(w => w.name === 'Git');
    if (gitWeapon && gitWeapon.branchPoint) {
      const bp = gitWeapon.branchPoint;
      ctx.save();
      // Branch 포인트 원
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#f05033';
      ctx.fill();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('B', bp.x, bp.y + 4);
      // 연결 점선
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = `rgba(240, 80, 51, ${0.4 + 0.3 * Math.sin(Date.now() / 200)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // SQL DROP TABLE 렌더
    const sqlWeapon = ownedWeapons.find(w => w.name === 'SQL');
    if (sqlWeapon && sqlWeapon.dropPhase !== 'idle') {
      ctx.save();
      const tx = sqlWeapon.targetX;
      const ty = sqlWeapon.targetY;

      if (sqlWeapon.dropPhase === 'targeting') {
        // 표적 십자선
        ctx.strokeStyle = 'rgba(68, 153, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx - 20, ty); ctx.lineTo(tx + 20, ty);
        ctx.moveTo(tx, ty - 20); ctx.lineTo(tx, ty + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tx, ty, 25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(68, 153, 255, 0.5)';
        ctx.stroke();
      }

      if (sqlWeapon.dropPhase === 'dropping' || sqlWeapon.dropPhase === 'landed') {
        // 낙하 블록
        const bY = sqlWeapon.blockY;
        ctx.fillStyle = '#1a3a6b';
        ctx.fillRect(tx - 30, bY - 20, 60, 40);
        ctx.fillStyle = '#4499ff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DROP', tx, bY - 4);
        ctx.fillText('TABLE', tx, bY + 8);
        // 착지 시 플래시
        if (sqlWeapon.flashTimer > 0) {
          ctx.fillStyle = `rgba(255,255,255,${sqlWeapon.flashTimer / 0.15 * 0.5})`;
          ctx.fillRect(tx - 120, ty - 120, 240, 240);
        }
      }
      ctx.restore();
    }

    // JavaScript 토네이도 렌더
    const jsWeaponR = ownedWeapons.find(w => w.name === 'JavaScript');
    if (jsWeaponR && jsWeaponR.tornado) {
      const t = jsWeaponR.tornado;
      const progress = 1 - (t.timer / t.maxTimer);
      ctx.save();
      // 반투명 노란 원 (외곽)
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(247, 223, 30, ${0.6 - progress * 0.3})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      // 안쪽 채우기
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247, 223, 30, ${0.08 + progress * 0.05})`;
      ctx.fill();
      // 회전하는 괄호 파티클 3개
      const symbols = ['(', '{', ')'];
      for (let i = 0; i < 3; i++) {
        const a = t.angle + (i / 3) * Math.PI * 2;
        const px = t.x + Math.cos(a) * t.radius * 0.7;
        const py = t.y + Math.sin(a) * t.radius * 0.7;
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = `rgba(247, 223, 30, 0.9)`;
        ctx.textAlign = 'center';
        ctx.fillText(symbols[i], px, py + 5);
      }
      ctx.restore();
    }

    // 가비지 오브젝트 렌더 (반투명 초록 원)
    for (const garbage of garbageObjects) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00dd44';
      ctx.beginPath();
      ctx.arc(garbage.x, garbage.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // FloatingText 렌더 (월드 좌표)
    floatingTextManager.render(ctx, camX, camY);

    ctx.restore();
    // ── 화면 공간 (HUD) ───────────────────────────────────────────

    // 플레이어 피격 비네팅
    if (player.hitFlashTimer > 0) {
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.75
      );
      grad.addColorStop(0, 'rgba(255,0,0,0)');
      grad.addColorStop(1, 'rgba(255,0,0,0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // HUD 렌더 (HP바, 킬카운트, 타이머, 이벤트 상태)
    hud.render(ctx, {
      playerHp: player.hp,
      playerMaxHp: player.maxHp,
      killCount: eventSystem.totalKills,
      q1Target: 100,
      elapsed: eventSystem.elapsed,
      e1State: eventSystem.e1State,
      e2State: eventSystem.e2State,
      bossState: eventSystem.bossState,
      e1Kills: eventSystem.e1Kills,
      e2Kills: eventSystem.e2Kills,
      e2Elapsed: eventSystem.e2Elapsed,
    });

    // 무기 목록 HUD
    ownedWeapons.forEach((w, i) => {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '13px monospace';
      ctx.fillText(`[${i + 1}] ${w.name}`, canvas.width - 12, 56 + i * 20);
    });
    ctx.textAlign = 'left';

    // 컨트롤 반전 상태 표시
    if (player.controlsReversed && player.controlsReversedTimer > 0) {
      ctx.fillStyle = '#aa00ff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 40);
    }

    // 무기 획득 알림
    if (rewardNotice) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rewardNotice, canvas.width / 2, canvas.height / 2 - 100);
      ctx.textAlign = 'left';
    }

    // HUD: 보스 HP 바
    if (boss) {
      const barW = 300, barH = 16;
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
      ctx.fillText(
        `장선형 ${boss.phase === 2 ? '[2페이즈]' : ''}  ${boss.hp} / ${boss.maxHp}`,
        canvas.width / 2, barY + barH + 14
      );
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

    // EventModal (항상 최상단)
    eventModal.render(ctx);

    ctx.textAlign = 'left';
  };

  // 게임 재시작 시 플로팅 텍스트 + 가비지 초기화
  floatingTextManager.texts = [];
  garbageObjects = [];

  game.addEntity(player);
  game.start();
}

// ─── 게임 오버 루프 ──────────────────────────────────────────────────────────
function gameOverLoop() {
  if (state !== 'game_over') return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderGameOver();
  requestAnimationFrame(gameOverLoop);
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

function renderGameOver() {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f44336';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);

  ctx.fillStyle = '#ffcccc';
  ctx.font = '16px monospace';
  ctx.fillText('김지윤이 쓰러졌다...', canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '13px monospace';
  ctx.fillText('[ R키로 재시작 ]', canvas.width / 2, canvas.height / 2 + 50);

  ctx.textAlign = 'left';
}
