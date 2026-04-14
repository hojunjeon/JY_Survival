export class UpgradeSystem {
  constructor() {
    this.materials = 0;
  }

  addMaterials(amount) {
    this.materials += amount;
  }

  getStatOptions() {
    return [
      { id: 'moveSpeed',   label: '이동속도 +20%' },
      { id: 'attackSpeed', label: '공격속도 +20% (쿨타임 감소)' },
      { id: 'damage',      label: '피해량 +20%' },
    ];
  }

  applyStatUpgrade(optionId, player, weapons) {
    if (optionId === 'moveSpeed') {
      player.speed *= 1.2;
    } else if (optionId === 'attackSpeed') {
      for (const w of weapons) {
        w.cooldown *= 0.8;
      }
    } else if (optionId === 'damage') {
      for (const w of weapons) {
        w.damage *= 1.2;
      }
    }
  }

  getEnhanceCost(weapon) {
    return weapon.enhanceLevel + 1;
  }

  enhanceWeapon(weapon) {
    const cost = this.getEnhanceCost(weapon);
    if (this.materials < cost) return false;
    this.materials -= cost;
    weapon.enhanceLevel += 1;
    weapon.damage *= 1.1;
    return true;
  }
}
