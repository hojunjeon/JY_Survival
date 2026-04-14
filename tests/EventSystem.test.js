import { describe, it, expect, beforeEach } from 'vitest';
import { EventSystem } from '../systems/EventSystem.js';

describe('EventSystem 초기 상태', () => {
  let es;

  beforeEach(() => {
    es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
  });

  it('elapsed는 0으로 시작한다', () => {
    expect(es.elapsed).toBe(0);
  });

  it('totalKills는 0으로 시작한다', () => {
    expect(es.totalKills).toBe(0);
  });

  it('E1은 pending 상태로 시작한다', () => {
    expect(es.e1State).toBe('pending');
  });

  it('E3는 pending 상태로 시작한다', () => {
    expect(es.e3State).toBe('pending');
  });

  it('Q1은 pending 상태로 시작한다', () => {
    expect(es.q1State).toBe('pending');
  });

  it('E1 킬 카운트는 0으로 시작한다', () => {
    expect(es.e1Kills).toBe(0);
  });

  it('E3 킬 카운트는 0으로 시작한다', () => {
    expect(es.e3Kills).toBe(0);
  });

  it('E3 경과 시간은 0으로 시작한다', () => {
    expect(es.e3Elapsed).toBe(0);
  });
});

describe('EventSystem.update() — 시간 경과', () => {
  let es;

  beforeEach(() => {
    es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
  });

  it('update(dt) 호출 시 elapsed가 증가한다', () => {
    es.update(5);
    expect(es.elapsed).toBeCloseTo(5);
  });

  it('E1 트리거 시간 이전에는 E1이 active되지 않는다', () => {
    es.update(29);
    expect(es.e1State).toBe('pending');
  });

  it('elapsed가 e1TriggerTime에 도달하면 E1이 active된다', () => {
    es.update(30);
    expect(es.e1State).toBe('active');
  });

  it('E1 트리거 시 update()가 이벤트 알림을 반환한다', () => {
    const notifications = es.update(30);
    const triggered = notifications.find(n => n.type === 'event_triggered' && n.event === 'E1');
    expect(triggered).toBeTruthy();
  });

  it('E3 트리거 시간 이전에는 E3가 active되지 않는다', () => {
    es.update(89);
    expect(es.e3State).toBe('pending');
  });

  it('elapsed가 e3TriggerTime에 도달하면 E3가 active된다', () => {
    es.update(90);
    expect(es.e3State).toBe('active');
  });

  it('E3 트리거 시 update()가 이벤트 알림을 반환한다', () => {
    const notifications = es.update(90);
    const triggered = notifications.find(n => n.type === 'event_triggered' && n.event === 'E3');
    expect(triggered).toBeTruthy();
  });

  it('이벤트가 없을 때 update()는 빈 배열을 반환한다', () => {
    const notifications = es.update(1);
    expect(notifications).toEqual([]);
  });
});

describe('EventSystem — Q1 퀘스트 (버그 100마리)', () => {
  let es;

  beforeEach(() => {
    es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
  });

  it('notifyKill 호출 시 totalKills가 증가한다', () => {
    es.notifyKill('syntax_error');
    expect(es.totalKills).toBe(1);
  });

  it('어떤 타입의 적을 처치해도 totalKills에 집계된다', () => {
    es.notifyKill('syntax_error');
    es.notifyKill('null_pointer');
    es.notifyKill('seg_fault');
    expect(es.totalKills).toBe(3);
  });

  it('99마리 처치 시 Q1은 여전히 pending이다', () => {
    for (let i = 0; i < 99; i++) es.notifyKill('syntax_error');
    expect(es.q1State).toBe('pending');
  });

  it('100마리 처치 시 Q1이 completed된다', () => {
    for (let i = 0; i < 100; i++) es.notifyKill('syntax_error');
    expect(es.q1State).toBe('completed');
  });

  it('Q1 완료 시 notifyKill이 quest_completed 알림을 반환한다', () => {
    for (let i = 0; i < 99; i++) es.notifyKill('syntax_error');
    const notifications = es.notifyKill('syntax_error'); // 100번째
    const completed = notifications.find(n => n.type === 'quest_completed' && n.quest === 'Q1');
    expect(completed).toBeTruthy();
  });

  it('Q1 완료 후 추가 처치해도 상태는 completed 유지된다', () => {
    for (let i = 0; i < 110; i++) es.notifyKill('syntax_error');
    expect(es.q1State).toBe('completed');
  });
});

describe('EventSystem — E1 이벤트 (IndentationError 15마리)', () => {
  let es;

  beforeEach(() => {
    es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
    es.update(30); // E1 트리거
  });

  it('E1 활성 중 indentation_error 처치가 e1Kills에 집계된다', () => {
    es.notifyKill('indentation_error');
    expect(es.e1Kills).toBe(1);
  });

  it('E1 활성 중 다른 타입 처치는 e1Kills에 집계되지 않는다', () => {
    es.notifyKill('syntax_error');
    expect(es.e1Kills).toBe(0);
  });

  it('14마리 처치 시 E1은 여전히 active다', () => {
    for (let i = 0; i < 14; i++) es.notifyKill('indentation_error');
    expect(es.e1State).toBe('active');
  });

  it('15마리 처치 시 E1이 cleared된다', () => {
    for (let i = 0; i < 15; i++) es.notifyKill('indentation_error');
    expect(es.e1State).toBe('cleared');
  });

  it('E1 클리어 시 notifyKill이 event_cleared 알림을 반환한다', () => {
    for (let i = 0; i < 14; i++) es.notifyKill('indentation_error');
    const notifications = es.notifyKill('indentation_error'); // 15번째
    const cleared = notifications.find(n => n.type === 'event_cleared' && n.event === 'E1');
    expect(cleared).toBeTruthy();
  });

  it('E1 pending 중에는 indentation_error 처치가 e1Kills에 집계되지 않는다', () => {
    const earlyEs = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
    earlyEs.notifyKill('indentation_error'); // E1 pending 상태
    expect(earlyEs.e1Kills).toBe(0);
  });
});

describe('EventSystem — E3 이벤트 (EnvError + 60초 생존)', () => {
  let es;

  beforeEach(() => {
    es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
    es.update(90); // E3 트리거
  });

  it('E3 활성 중 e3Elapsed가 누적된다', () => {
    es.update(10);
    expect(es.e3Elapsed).toBeCloseTo(10);
  });

  it('E3 활성 중 env_error 처치가 e3Kills에 집계된다', () => {
    es.notifyKill('env_error');
    expect(es.e3Kills).toBe(1);
  });

  it('E3 활성 중 다른 타입 처치는 e3Kills에 집계되지 않는다', () => {
    es.notifyKill('syntax_error');
    expect(es.e3Kills).toBe(0);
  });

  it('60초 생존해도 env_error 처치 없으면 E3 cleared 안 된다', () => {
    es.update(60);
    expect(es.e3State).toBe('active');
  });

  it('env_error 처치해도 60초 미만이면 E3 cleared 안 된다', () => {
    es.notifyKill('env_error');
    es.update(59);
    expect(es.e3State).toBe('active');
  });

  it('env_error 1마리 이상 처치 + 60초 생존 시 E3가 cleared된다', () => {
    es.notifyKill('env_error');
    es.update(60);
    expect(es.e3State).toBe('cleared');
  });

  it('E3 클리어 시 update()가 event_cleared 알림을 반환한다', () => {
    es.notifyKill('env_error');
    const notifications = es.update(60);
    const cleared = notifications.find(n => n.type === 'event_cleared' && n.event === 'E3');
    expect(cleared).toBeTruthy();
  });

  it('E3 pending 중에는 env_error 처치가 e3Kills에 집계되지 않는다', () => {
    const earlyEs = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
    earlyEs.notifyKill('env_error');
    expect(earlyEs.e3Kills).toBe(0);
  });
});

describe('EventSystem — 복합 시나리오', () => {
  it('E1 cleared 후 E3는 독립적으로 동작한다', () => {
    const es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });
    es.update(30); // E1 트리거
    for (let i = 0; i < 15; i++) es.notifyKill('indentation_error'); // E1 클리어
    es.update(60); // E3 트리거 시점(90초)에 도달
    expect(es.e3State).toBe('active');
  });

  it('기본값으로 생성 시에도 정상 동작한다', () => {
    const es = new EventSystem();
    expect(es.e1State).toBe('pending');
    expect(es.e3State).toBe('pending');
    expect(es.q1State).toBe('pending');
  });
});
