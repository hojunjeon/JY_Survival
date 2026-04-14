import { describe, it, expect, beforeEach } from 'vitest';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';

describe('UpgradeSystem — 강화 재화', () => {
  let sys;
  beforeEach(() => { sys = new UpgradeSystem(); });

  it('초기 재화는 0이다', () => {
    expect(sys.materials).toBe(0);
  });

  it('addMaterials로 재화가 쌓인다', () => {
    sys.addMaterials(3);
    expect(sys.materials).toBe(3);
  });

  it('addMaterials는 여러 번 호출 가능하다', () => {
    sys.addMaterials(2);
    sys.addMaterials(5);
    expect(sys.materials).toBe(7);
  });
});

describe('UpgradeSystem — 스탯 업그레이드', () => {
  let sys;
  beforeEach(() => { sys = new UpgradeSystem(); });

  it('getStatOptions는 3가지 선택지를 반환한다', () => {
    const opts = sys.getStatOptions();
    expect(opts).toHaveLength(3);
    const ids = opts.map(o => o.id);
    expect(ids).toContain('moveSpeed');
    expect(ids).toContain('attackSpeed');
    expect(ids).toContain('damage');
  });

  it('각 옵션은 id와 label을 가진다', () => {
    const opts = sys.getStatOptions();
    opts.forEach(o => {
      expect(o.id).toBeTruthy();
      expect(o.label).toBeTruthy();
    });
  });

  it('moveSpeed 선택 시 플레이어 speed가 20% 증가한다', () => {
    const player = { speed: 160 };
    sys.applyStatUpgrade('moveSpeed', player, []);
    expect(player.speed).toBeCloseTo(192);
  });

  it('attackSpeed 선택 시 무기 cooldown이 20% 감소한다', () => {
    const weapon = { cooldown: 1.0 };
    sys.applyStatUpgrade('attackSpeed', {}, [weapon]);
    expect(weapon.cooldown).toBeCloseTo(0.8);
  });

  it('attackSpeed는 보유 무기 전체에 적용된다', () => {
    const w1 = { cooldown: 1.0 };
    const w2 = { cooldown: 0.5 };
    sys.applyStatUpgrade('attackSpeed', {}, [w1, w2]);
    expect(w1.cooldown).toBeCloseTo(0.8);
    expect(w2.cooldown).toBeCloseTo(0.4);
  });

  it('damage 선택 시 무기 damage가 20% 증가한다', () => {
    const weapon = { damage: 10 };
    sys.applyStatUpgrade('damage', {}, [weapon]);
    expect(weapon.damage).toBeCloseTo(12);
  });

  it('damage는 보유 무기 전체에 적용된다', () => {
    const w1 = { damage: 10 };
    const w2 = { damage: 20 };
    sys.applyStatUpgrade('damage', {}, [w1, w2]);
    expect(w1.damage).toBeCloseTo(12);
    expect(w2.damage).toBeCloseTo(24);
  });

  it('잘못된 optionId는 아무것도 변경하지 않는다', () => {
    const player = { speed: 160 };
    sys.applyStatUpgrade('invalid', player, []);
    expect(player.speed).toBe(160);
  });
});

describe('UpgradeSystem — 무기 강화', () => {
  let sys;
  beforeEach(() => { sys = new UpgradeSystem(); });

  it('getEnhanceCost는 level 0 무기의 비용으로 1을 반환한다', () => {
    const weapon = { enhanceLevel: 0 };
    expect(sys.getEnhanceCost(weapon)).toBe(1);
  });

  it('getEnhanceCost는 레벨마다 비용이 1씩 증가한다', () => {
    expect(sys.getEnhanceCost({ enhanceLevel: 0 })).toBe(1);
    expect(sys.getEnhanceCost({ enhanceLevel: 1 })).toBe(2);
    expect(sys.getEnhanceCost({ enhanceLevel: 2 })).toBe(3);
  });

  it('enhanceWeapon은 재료가 부족하면 false를 반환한다', () => {
    const weapon = { enhanceLevel: 0, damage: 10 };
    sys.materials = 0;
    const result = sys.enhanceWeapon(weapon);
    expect(result).toBe(false);
  });

  it('enhanceWeapon 성공 시 재화를 소모하고 true를 반환한다', () => {
    const weapon = { enhanceLevel: 0, damage: 10 };
    sys.addMaterials(1);
    const result = sys.enhanceWeapon(weapon);
    expect(result).toBe(true);
    expect(sys.materials).toBe(0);
  });

  it('enhanceWeapon 성공 시 enhanceLevel이 1 증가한다', () => {
    const weapon = { enhanceLevel: 0, damage: 10 };
    sys.addMaterials(1);
    sys.enhanceWeapon(weapon);
    expect(weapon.enhanceLevel).toBe(1);
  });

  it('enhanceWeapon 성공 시 damage가 10% 증가한다', () => {
    const weapon = { enhanceLevel: 0, damage: 10 };
    sys.addMaterials(1);
    sys.enhanceWeapon(weapon);
    expect(weapon.damage).toBeCloseTo(11);
  });

  it('레벨 2 강화에는 재화 2개가 필요하다', () => {
    const weapon = { enhanceLevel: 1, damage: 10 };
    sys.addMaterials(1);
    const result = sys.enhanceWeapon(weapon);
    expect(result).toBe(false); // 재화 부족
    sys.addMaterials(1); // 추가로 1개 더 = 총 2개
    const result2 = sys.enhanceWeapon(weapon);
    expect(result2).toBe(true);
  });
});
