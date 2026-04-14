import { PythonWeapon } from '../weapons/Python.js';
import { CWeapon } from '../weapons/C.js';
import { JavaWeapon } from '../weapons/Java.js';

const STAGE1_OPTIONS = [
  {
    name: 'Python',
    description: '360° 자동 투사체 — 범위 넓음, 느림',
    create: () => new PythonWeapon(),
  },
  {
    name: 'C/C++',
    description: '전방 고속 단일 관통탄 — 빠름, 고데미지',
    create: () => new CWeapon(),
  },
  {
    name: 'Java',
    description: '주변 오비탈 오브 3개 — 자동 접촉 공격',
    create: () => new JavaWeapon(),
  },
];

export class WeaponMenu {
  getOptions() {
    return STAGE1_OPTIONS.map(opt => ({
      name: opt.name,
      description: opt.description,
    }));
  }

  select(index) {
    if (index < 0 || index >= STAGE1_OPTIONS.length) return null;
    return STAGE1_OPTIONS[index].create();
  }
}
