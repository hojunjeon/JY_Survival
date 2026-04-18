export class EventSystem {
  constructor({ e1TriggerTime = 30, e2TriggerTime = 90, q1Target = 100, bossTriggerDelay = 30 } = {}) {
    this._e1TriggerTime = e1TriggerTime;
    this._e2TriggerTime = e2TriggerTime;
    this._q1Target = q1Target;
    this._bossTriggerDelay = bossTriggerDelay;

    this.elapsed = 0;
    this.totalKills = 0;

    this.e1State = 'pending';
    this.e1Kills = 0;

    this.e2State = 'pending';
    this.e2Kills = 0;
    this.e2Elapsed = 0;

    this.q1State = 'pending';

    this.bossState = 'pending';
    this._e2ClearedAt = null;
  }

  update(dt) {
    const notifications = [];
    this.elapsed += dt;

    // E2 경과 시간 누적
    if (this.e2State === 'active') {
      this.e2Elapsed += dt;
      // E2 클리어 조건: 30초 생존
      if (this.e2Elapsed >= 30) {
        this.e2State = 'cleared';
        notifications.push({ type: 'event_cleared', event: 'E2' });
      }
    }

    // E1 트리거
    if (this.e1State === 'pending' && this.elapsed >= this._e1TriggerTime) {
      this.e1State = 'active';
      notifications.push({ type: 'event_triggered', event: 'E1' });
    }

    // E2 트리거
    if (this.e2State === 'pending' && this.elapsed >= this._e2TriggerTime) {
      this.e2State = 'active';
      notifications.push({ type: 'event_triggered', event: 'E2' });
    }

    // E2 클리어 시점 기록
    if (this.e2State === 'cleared' && this._e2ClearedAt === null) {
      this._e2ClearedAt = this.elapsed;
    }

    // 보스 등장 트리거: E2 클리어 후 bossTriggerDelay 경과
    if (
      this.bossState === 'pending' &&
      this._e2ClearedAt !== null &&
      this.elapsed >= this._e2ClearedAt + this._bossTriggerDelay
    ) {
      this.bossState = 'active';
      notifications.push({ type: 'boss_triggered' });
    }

    return notifications;
  }

  notifyBossKill() {
    if (this.bossState !== 'active') return [];
    this.bossState = 'dead';
    return [
      { type: 'boss_killed' },
      { type: 'stage_clear' },
    ];
  }

  notifyKill(enemyType) {
    const notifications = [];
    this.totalKills += 1;

    // E1 킬 집계
    if (this.e1State === 'active' && enemyType === 'indentation_error') {
      this.e1Kills += 1;
      if (this.e1Kills >= 15) {
        this.e1State = 'cleared';
        notifications.push({ type: 'event_cleared', event: 'E1' });
      }
    }

    // E2 킬 집계 (무한 스폰 모드는 처치수 집계만, 클리어 조건 제외)
    if (this.e2State === 'active' && enemyType === 'env_error') {
      this.e2Kills += 1;
    }

    // Q1 퀘스트
    if (this.q1State === 'pending' && this.totalKills >= this._q1Target) {
      this.q1State = 'completed';
      notifications.push({ type: 'quest_completed', quest: 'Q1' });
    }

    return notifications;
  }
}
