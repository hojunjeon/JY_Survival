export class Stage1 {
  constructor({ player, waveSystem, eventSystem, upgradeSystem, canvasWidth, canvasHeight }) {
    this.player = player;
    this.waveSystem = waveSystem;
    this.eventSystem = eventSystem;
    this.upgradeSystem = upgradeSystem;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.enemies = [];
    this.projectiles = [];
    this.weapons = [];
    this.boss = null;
    this.state = 'playing'; // 'playing' | 'stage_clear' | 'game_over'
    this.pendingUpgrade = null; // 'stat' when Q1 completed
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  update(dt) {
    const events = [];

    // 1. 웨이브 스폰 (보스 없을 때만)
    if (!this.boss) {
      const newEnemies = this.waveSystem.update(dt);
      this.enemies.push(...newEnemies);
    }

    // 2. 이벤트 시스템 업데이트
    const notifications = this.eventSystem.update(dt);
    for (const n of notifications) {
      if (n.type === 'boss_triggered') {
        this.enemies = [];
        events.push({ type: 'boss_triggered' });
      }
      if (n.type === 'event_cleared') {
        this.upgradeSystem.addMaterials(2);
        events.push(n);
      }
      if (n.type === 'event_triggered') {
        events.push(n);
      }
    }

    // 3. 죽은 적 처리 → 킬 통보 → Q1 퀘스트 확인
    const dead = this.enemies.filter(e => e.isDead);
    for (const e of dead) {
      if (e.dropsHpItem) this.player.heal(20);
      const killNotifs = this.eventSystem.notifyKill(e.type);
      for (const n of killNotifs) {
        if (n.type === 'quest_completed' && n.quest === 'Q1') {
          this.pendingUpgrade = 'stat';
        }
        events.push(n);
      }
    }
    this.enemies = this.enemies.filter(e => !e.isDead);

    return events;
  }

  getHudState() {
    return {
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      killCount: this.eventSystem.totalKills,
      q1Target: this.eventSystem._q1Target,
      elapsed: this.eventSystem.elapsed,
      e1State: this.eventSystem.e1State,
      e3State: this.eventSystem.e3State,
      bossState: this.eventSystem.bossState,
    };
  }
}
