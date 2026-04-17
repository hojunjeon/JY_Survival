import { describe, it, expect, beforeEach } from 'vitest';
import { EventModal } from '../ui/EventModal.js';

describe('EventModal', () => {
  let modal;

  beforeEach(() => {
    modal = new EventModal({ canvasWidth: 800, canvasHeight: 600 });
  });

  it('초기 상태는 visible=false', () => {
    expect(modal.visible).toBe(false);
  });

  it('show("triggered", "E1") 호출 시 visible=true, eventId, type 설정', () => {
    modal.show('triggered', 'E1');
    expect(modal.visible).toBe(true);
    expect(modal.eventId).toBe('E1');
    expect(modal.type).toBe('triggered');
  });

  it('show("triggered", "E1") 호출 시 E1 메시지에 IndentationError가 포함된다', () => {
    modal.show('triggered', 'E1');
    expect(modal.message).toContain('IndentationError');
  });

  it('show("cleared", "E1") 호출 시 reward에 재화가 포함된다', () => {
    modal.show('cleared', 'E1');
    expect(modal.reward).toContain('재화');
  });

  it('show("triggered", "E3") 호출 시 E3 메시지에 IDE가 포함된다', () => {
    modal.show('triggered', 'E3');
    expect(modal.message).toContain('IDE');
  });

  it('hide() 호출 시 visible=false', () => {
    modal.show('triggered', 'E1');
    modal.hide();
    expect(modal.visible).toBe(false);
  });

  it('show("triggered", "E1") 호출 시 박진우 캐릭터가 설정된다', () => {
    modal.show('triggered', 'E1');
    expect(modal.character).toBe('박진우');
  });

  it('show("triggered", "E3") 호출 시 이한정 캐릭터가 설정된다', () => {
    modal.show('triggered', 'E3');
    expect(modal.character).toBe('이한정');
  });

  it('show("cleared", "E1") 호출 시 character가 null이다', () => {
    modal.show('cleared', 'E1');
    expect(modal.character).toBeNull();
  });

  it('show("triggered", "E1") 호출 시 dialogueLines 배열이 존재한다', () => {
    modal.show('triggered', 'E1');
    expect(Array.isArray(modal.dialogueLines)).toBe(true);
    expect(modal.dialogueLines.length).toBeGreaterThan(0);
  });

  it('show("triggered", "E3") 호출 시 dialogueLines 배열이 존재한다', () => {
    modal.show('triggered', 'E3');
    expect(Array.isArray(modal.dialogueLines)).toBe(true);
    expect(modal.dialogueLines.length).toBeGreaterThan(0);
  });
});

describe('EventModal 새 레이아웃', () => {
  test('show("triggered", "E1", {progress: "5/15"}) — visible=true, progress 저장', () => {
    const modal = new EventModal({ canvasWidth: 600, canvasHeight: 600 });
    modal.show('triggered', 'E1', { progress: '5/15' });
    expect(modal.visible).toBe(true);
    expect(modal.extra?.progress).toBe('5/15');
  });

  test('show("triggered", "E1") — extra 없이도 동작', () => {
    const modal = new EventModal({ canvasWidth: 600, canvasHeight: 600 });
    modal.show('triggered', 'E1');
    expect(modal.visible).toBe(true);
    expect(modal.extra).toEqual({});
  });

  test('hide() 후 visible=false', () => {
    const modal = new EventModal({ canvasWidth: 600, canvasHeight: 600 });
    modal.show('triggered', 'E1');
    modal.hide();
    expect(modal.visible).toBe(false);
  });
});
