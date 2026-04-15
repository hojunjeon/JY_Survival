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
});
