export class EventSystem {
  constructor({ e1TriggerTime = 30, e3TriggerTime = 90, q1Target = 100, bossTriggerDelay = 30 } = {}) {
    this._e1TriggerTime = e1TriggerTime;
    this._e3TriggerTime = e3TriggerTime;
    this._q1Target = q1Target;
    this._bossTriggerDelay = bossTriggerDelay;

    this.elapsed = 0;
    this.totalKills = 0;

    this.e1State = 'pending';
    this.e1Kills = 0;

    this.e3State = 'pending';
    this.e3Kills = 0;
    this.e3Elapsed = 0;

    this.q1State = 'pending';

    this.bossState = 'pending';
    this._e3ClearedAt = null;
  }

  update(dt) {
    const notifications = [];
    this.elapsed += dt;

    // E3 경과 시간 누적
    if (this.e3State === 'active') {
      this.e3Elapsed += dt;
      // E3 클리어 조건: env_error 1마리 이상 처치 + 60초 생존
      if (this.e3Kills >= 1 && this.e3Elapsed >= 60) {
        this.e3State = 'cleared';
        notifications.push({ type: 'event_cleared', event: 'E3' });
      }
    }

    // E1 트리거
    if (this.e1State === 'pending' && this.elapsed >= this._e1TriggerTime) {
      this.e1State = 'active';
      notifications.push({ type: 'event_triggered', event: 'E1' });
    }

    // E3 트리거
    if (this.e3State === 'pending' && this.elapsed >= this._e3TriggerTime) {
      this.e3State = 'active';
      notifications.push({ type: 'event_triggered', event: 'E3' });
    }

    // E3 클리어 시점 기록
    if (this.e3State === 'cleared' && this._e3ClearedAt === null) {
      this._e3ClearedAt = this.elapsed;
    }

    // 보스 등장 트리거: E3 클리어 후 bossTriggerDelay 경과
    if (
      this.bossState === 'pending' &&
      this._e3ClearedAt !== null &&
      this.elapsed >= this._e3ClearedAt + this._bossTriggerDelay
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

    // E3 킬 집계
    if (this.e3State === 'active' && enemyType === 'env_error') {
      this.e3Kills += 1;
    }

    // Q1 퀘스트
    if (this.q1State === 'pending' && this.totalKills >= this._q1Target) {
      this.q1State = 'completed';
      notifications.push({ type: 'quest_completed', quest: 'Q1' });
    }

    return notifications;
  }
}
