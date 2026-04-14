import { WeaponBase } from './WeaponBase.js';

export class CWeapon extends WeaponBase {
  constructor() {
    super({ damage: 35, cooldown: 0.25, projectileSpeed: 500, piercing: true });
    this.name = 'C/C++';
  }
}
