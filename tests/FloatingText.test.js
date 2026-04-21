import { describe, it, expect, beforeEach } from 'vitest';
import { FloatingTextManager } from '../ui/FloatingText.js';

describe('FloatingTextManager', () => {
  let mgr;
  beforeEach(() => { mgr = new FloatingTextManager(); });

  it('기본 duration은 1.0이다', () => {
    mgr.add('test', 0, 0);
    expect(mgr.texts[0].life).toBe(1.0);
  });

  it('options.duration을 적용한다', () => {
    mgr.add('test', 0, 0, '#fff', { duration: 2.0 });
    expect(mgr.texts[0].life).toBe(2.0);
  });

  it('options.size를 저장한다', () => {
    mgr.add('test', 0, 0, '#fff', { size: 22 });
    expect(mgr.texts[0].size).toBe(22);
  });

  it('기본 size는 14이다', () => {
    mgr.add('test', 0, 0);
    expect(mgr.texts[0].size).toBe(14);
  });

  it('update 후 만료된 텍스트는 제거된다', () => {
    mgr.add('test', 0, 0, '#fff', { duration: 0.1 });
    mgr.update(0.2);
    expect(mgr.texts.length).toBe(0);
  });
});
