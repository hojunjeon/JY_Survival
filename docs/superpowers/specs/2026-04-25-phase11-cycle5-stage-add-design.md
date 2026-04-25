# Spec: Phase 11 Cycle 5 — 스테이지 추가 (Stage 2·3)

**날짜:** 2026-04-25
**Phase:** 11 / Cycle 5
**분류:** add
**참조 예제:** `phase11-cycle5-stage-add.html`

---

## 목표

Stage 1 클리어 후 진행 가능한 Stage 2(프론트엔드 정원)와 Stage 3(백엔드 서버룸)을 추가한다.
배경과 버그 타입만 교체하고 지형·충돌 구조는 변경하지 않는다.

---

## 스테이지 잠금 해제

- Stage 2: Stage 1 클리어 후 자동 해금
- Stage 3: Stage 2 클리어 후 자동 해금
- `main.js`에 `unlockedStages = [1]` 배열로 관리

---

## 신규 파일

### `stages/StageConfig.js`

```js
export const STAGES = {
  1: {
    bg: { color: '#1e1e2e', gridColor: 'rgba(78,201,176,0.08)' },
    bugs: ['SyntaxError', 'NullPointerException', 'SegFault', 'HealBug', 'EnvError'],
    weakWeapons: [],
    bossName: '장선형 v1',
  },
  2: {
    bg: { color: '#1a0f1f', gridColor: 'rgba(250,179,135,0.06)' },
    bugs: ['CSSError', 'LayoutBug', 'FlexboxGhost', 'AnimationLeak', 'HealBug'],
    weakWeapons: ['python', 'javascript'],
    bossName: '장선형 v2',
  },
  3: {
    bg: { color: '#040810', gridColor: 'rgba(137,180,250,0.06)' },
    bugs: ['DeadlockError', 'SQLInjection', 'N1Query', 'MemoryLeak', 'HealBug'],
    weakWeapons: ['javascript', 'linuxbash'],
    bossName: '장선형 v3',
  },
};
```

---

## 신규 버그 타입 (Stage 2)

| 버그 | 이동 | 체력 | 데미지 | 색상 |
|------|------|------|--------|------|
| CSSError | 나비형 곡선 이동 | 낮음 | 낮음 | `#fab387` (오렌지 파스텔) |
| LayoutBug | 좌우 지그재그 | 보통 | 보통 | `#f5c2e7` (핑크) |
| FlexboxGhost | 반투명 고속 | 낮음 | 낮음 | `#cba6f7` (퍼플) |
| AnimationLeak | 느림, 주기적 분열 | 높음 | 높음 | `#a6e3a1` (그린) |

## 신규 버그 타입 (Stage 3)

| 버그 | 이동 | 체력 | 데미지 | 색상 |
|------|------|------|--------|------|
| DeadlockError | 정지 → 순간이동 | 높음 | 높음 | `#89b4fa` (블루) |
| SQLInjection | 직선 고속 관통 | 낮음 | 보통 | `#f38ba8` (레드) |
| N1Query | 소환형 (처치 시 분열 ×2) | 보통 | 낮음 | `#94e2d5` (틸) |
| MemoryLeak | 느림, 시간 경과 체력 증가 | 가변 | 높음 | `#f9e2af` (옐로) |

---

## 배경 렌더링

`main.js`의 배경 렌더링 부분에서 `STAGES[currentStage].bg` 읽어 적용:
- Stage 2: 파스텔 그라데이션 BG + 꽃잎 부유 파티클 (배경 레이어)
- Stage 3: 다크 CRT BG + scanline 효과 + 서버랙 실루엣 (배경 레이어)

---

## 보스 차별화

| 스테이지 | 보스 | 변경점 |
|----------|------|--------|
| Stage 1 | 장선형 v1 | 기존 동일 |
| Stage 2 | 장선형 v2 | 이동속도 ×1.2, 투사체 4방향 |
| Stage 3 | 장선형 v3 | 이동속도 ×1.4, 투사체 5방향, Phase2 HP 70% |

---

## StageClear → 스테이지 선택

- StageClear 화면 "다음 스테이지" 버튼 → weapon-select 상태로 복귀
- `currentStage` 1 증가 후 해금 목록 체크
- 최종 Stage 3 클리어 시 "ALL CLEAR" 화면 (GameOver 화면 재활용, 텍스트만 변경)

## WeaponSelect 확장 (Stage 2+)

Cycle 1 WeaponSelect는 Stage 1 고정 3종만 표시. Stage 2+ 진입 시:
- 소유 무기 전체 목록 표시 (최대 8종)
- 플레이어가 최대 4개 선택 후 확인
- 선택 수 표시: "선택됨: 2 / 4"
- `weapon-select` draw 메서드에 `currentStage` 파라미터 추가해 분기

---

## 구현 범위 제외

- 지형 충돌체 변경 — 없음 (배경+버그 타입만 교체)
- Stage 선택 메뉴 UI — 없음 (Stage 1 → 2 → 3 순차 진행)
- 스테이지 반복 플레이 — Phase 12
