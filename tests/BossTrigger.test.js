import { describe, it, expect, beforeEach } from 'vitest';
import { EventSystem } from '../systems/EventSystem.js';

describe('EventSystem — 보스 등장 트리거', () => {
  let es;

  beforeEach(() => {
    // E3 클리어 후 30초 경과 시 보스 등장
    es = new EventSystem({
      e1TriggerTime: 30,
      e3TriggerTime: 90,
      q1Target: 100,
      bossTriggerDelay: 30,
    });
  });

  it('초기 bossState는 pending이다', () => {
    expect(es.bossState).toBe('pending');
  });

  it('E3 미클리어 상태에서 시간이 지나도 보스는 등장하지 않는다', () => {
    es.update(200);
    expect(es.bossState).toBe('pending');
  });

  it('E3 클리어 직후에는 보스가 등장하지 않는다', () => {
    es.update(90);            // E3 트리거
    es.notifyKill('env_error');
    es.update(60);            // E3 클리어

    expect(es.bossState).toBe('pending');
  });

  it('E3 클리어 후 bossTriggerDelay 경과 시 보스가 등장한다', () => {
    es.update(90);            // E3 트리거
    es.notifyKill('env_error');
    es.update(60);            // E3 클리어
    es.update(30);            // bossTriggerDelay 경과

    expect(es.bossState).toBe('active');
  });

  it('보스 등장 시 boss_triggered 알림이 반환된다', () => {
    es.update(90);
    es.notifyKill('env_error');
    es.update(60);
    const notifications = es.update(30);
    const triggered = notifications.find(n => n.type === 'boss_triggered');
    expect(triggered).toBeTruthy();
  });

  it('보스 등장 이후 추가 update에서는 boss_triggered가 반환되지 않는다', () => {
    es.update(90);
    es.notifyKill('env_error');
    es.update(60);
    es.update(30); // 최초 트리거
    const notifications = es.update(10);
    const triggered = notifications.find(n => n.type === 'boss_triggered');
    expect(triggered).toBeFalsy();
  });

  it('bossTriggerDelay 기본값은 30이다', () => {
    const defaultEs = new EventSystem();
    expect(defaultEs._bossTriggerDelay).toBe(30);
  });

  it('보스가 처치되면 bossState가 dead가 된다', () => {
    es.update(90);
    es.notifyKill('env_error');
    es.update(60);
    es.update(30);             // 보스 등장

    const notifications = es.notifyBossKill();
    expect(es.bossState).toBe('dead');
  });

  it('보스 처치 시 boss_killed 알림이 반환된다', () => {
    es.update(90);
    es.notifyKill('env_error');
    es.update(60);
    es.update(30);

    const notifications = es.notifyBossKill();
    const killed = notifications.find(n => n.type === 'boss_killed');
    expect(killed).toBeTruthy();
  });

  it('보스 처치 시 stage_clear 알림이 반환된다', () => {
    es.update(90);
    es.notifyKill('env_error');
    es.update(60);
    es.update(30);

    const notifications = es.notifyBossKill();
    const cleared = notifications.find(n => n.type === 'stage_clear');
    expect(cleared).toBeTruthy();
  });

  it('보스 처치 전 notifyBossKill 호출 시 아무 알림도 없다', () => {
    const notifications = es.notifyBossKill();
    expect(notifications).toEqual([]);
  });
});
