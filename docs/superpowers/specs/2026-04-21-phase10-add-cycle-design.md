# Phase 10 추가 사이클 — 타격 이펙트 & 시각 피드백 설계

**날짜**: 2026-04-21  
**사이클**: Phase 10 추가(Add)  
**태스크**: T1 타격 이펙트 강화 / T2 무기별 시각 피드백 개선

---

## 1. 범위

| 태스크 | 내용 |
|--------|------|
| T1 | 파티클 효과, 피격 플래시, Screen Shake 전면 적용 |
| T2 | 데미지 텍스트 팝업 색상·크기 차별화, 투사체 shape 차별화 |

---

## 2. 신규 파일

### `systems/ParticleSystem.js`

**Particle 구조체**
```
{ x, y, vx, vy, life, maxLife, color, size }
```

**ParticleSystem 메서드**

| 메서드 | 설명 | 파라미터 |
|--------|------|---------|
| `addHitSpark(x, y, color, count=5)` | 타격 불꽃 — 랜덤 방향 방사 | 적 피격 위치, 무기 색상 |
| `addEnemyDeath(x, y, count=8)` | 적 사망 파편 — 분홍/회색 | 적 사망 위치 |
| `addHeal(x, y)` | 회복 — 녹색 파티클 위로 상승 | 플레이어 위치 |
| `update(dt)` | life 감소, 만료 제거 | — |
| `render(ctx, cameraX, cameraY)` | 알파 페이드아웃 + 크기 축소 | — |

**렌더링 규칙**
- `globalAlpha = life / maxLife`
- `size = baseSze * (life / maxLife)`
- 각 파티클은 원(arc) 렌더링

---

## 3. 수정 파일

### `ui/FloatingTextManager` 시그니처 확장

```js
add(text, x, y, color = '#ffffff', options = {})
// options.size     — 폰트 크기 (기본 14)
// options.duration — 생존 시간 (기본 1.0s)
```

**무기별 데미지 텍스트 색상**

| 무기 | 색상 코드 |
|------|---------|
| Python | `#3572A5` |
| Java | `#b07219` |
| C/C++ | `#555555` |
| Git | `#f05033` |
| SQL | `#e38c00` |
| JavaScript | `#f1e05a` |
| Django | `#0c4b33` |
| LinuxBash | `#89e051` |
| 기본(미지정) | `#ffffff` |

**크리티컬 판정**: 단타 데미지 20 이상 → 텍스트 `'!!-{n}!!'`, size 22, duration 1.3s

---

### `entities/Projectile.js`

`weaponType` 프로퍼티 추가 (문자열, 기본 `'default'`).

**render() 분기**

| weaponType | 렌더링 shape |
|------------|------------|
| `'python'` | 원형 (arc, radius=5) |
| `'c'` | 마름모 (45° 회전 rect, 8×8) |
| `'railgun'` | 기존 긴 rect 유지 |
| 그 외 | 기존 사각형 유지 |

---

### `entities/Player.js`

`render()` 에 hitFlash 오버레이 추가:

```
if (hitFlashTimer > 0)
  → ctx.fillStyle = 'rgba(255,0,0,0.45)'
  → fillRect (플레이어 바운딩박스)
```

---

### `main.js`

**ParticleSystem 인스턴스화**
```js
import { ParticleSystem } from './systems/ParticleSystem.js';
const particleSystem = new ParticleSystem();
```

**Screen Shake 트리거 테이블**

| 이벤트 | intensity | duration |
|--------|-----------|----------|
| 일반 적 피격 | 2 | 0.1s |
| 적 사망 | 3 | 0.15s |
| 보스 피격 | 6 | 0.3s |
| 플레이어 피격 | 5 | 0.2s |

**게임 루프 연동**
- 적 피격 시: `particleSystem.addHitSpark()` + `triggerScreenShake(2, 0.1)`
- 적 사망 시: `particleSystem.addEnemyDeath()` + `triggerScreenShake(3, 0.15)`
- 보스 피격 시: `particleSystem.addHitSpark()` + `triggerScreenShake(6, 0.3)`
- 플레이어 피격 시: `floatingTextManager.add('-{n}HP', ..., '#ff4444')` + `triggerScreenShake(5, 0.2)`
- HP 회복 시: `particleSystem.addHeal()` + `floatingTextManager.add('+{n}HP', ..., '#4caf50')`
- 렌더 단계: `particleSystem.render(ctx, cameraX, cameraY)`

**데미지 텍스트 연동**
- 적 피격 콜백에서 weapon의 `weaponType`/`color` 기반으로 색상 결정
- `floatingTextManager.add('-{damage}', e.x, e.y - 20, weaponColor, { size, duration })`

---

## 4. 테스트

| 파일 | 테스트 항목 |
|------|-----------|
| `tests/ParticleSystem.test.js` | addHitSpark 파티클 count, update life 감소, 만료 파티클 제거 |
| `tests/FloatingText.test.js` | options.size/duration 적용 확인, 크리티컬 텍스트 포맷 |
| `tests/Projectile.test.js` | weaponType 프로퍼티 기본값 확인 |

---

## 5. 구현 순서

1. `ParticleSystem.js` 작성 + 테스트
2. `FloatingTextManager` 확장 + 테스트
3. `Projectile.js` weaponType 추가
4. `Player.js` hitFlash 렌더링 구현
5. `main.js` 연동 (Screen Shake 확장 + 파티클 + 데미지 텍스트)
