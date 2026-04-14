import { describe, it, expect } from 'vitest';
import { WeaponMenu } from '../ui/Menu.js';
import { PythonWeapon } from '../weapons/Python.js';
import { CWeapon } from '../weapons/C.js';
import { JavaWeapon } from '../weapons/Java.js';

describe('WeaponMenu', () => {
  it('Stage 1 옵션은 Python, C/C++, Java 3종이다', () => {
    const menu = new WeaponMenu();
    const options = menu.getOptions();
    const names = options.map(o => o.name);
    expect(names).toContain('Python');
    expect(names).toContain('C/C++');
    expect(names).toContain('Java');
    expect(options.length).toBe(3);
  });

  it('select(0)은 PythonWeapon 인스턴스를 반환한다', () => {
    const menu = new WeaponMenu();
    const weapon = menu.select(0);
    expect(weapon).toBeInstanceOf(PythonWeapon);
  });

  it('select(1)은 CWeapon 인스턴스를 반환한다', () => {
    const menu = new WeaponMenu();
    const weapon = menu.select(1);
    expect(weapon).toBeInstanceOf(CWeapon);
  });

  it('select(2)는 JavaWeapon 인스턴스를 반환한다', () => {
    const menu = new WeaponMenu();
    const weapon = menu.select(2);
    expect(weapon).toBeInstanceOf(JavaWeapon);
  });

  it('범위 밖 인덱스를 선택하면 null을 반환한다', () => {
    const menu = new WeaponMenu();
    expect(menu.select(-1)).toBeNull();
    expect(menu.select(3)).toBeNull();
  });

  it('각 옵션에는 name과 description이 있다', () => {
    const menu = new WeaponMenu();
    menu.getOptions().forEach(opt => {
      expect(typeof opt.name).toBe('string');
      expect(typeof opt.description).toBe('string');
    });
  });
});
