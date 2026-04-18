# [JY Survival 개발일지 16편] Phase 6 Cycle 2 — 무기 전면 재설계 + 게임 피드백 이펙트

> 이번 사이클은 "게임이 더 재미있어지는 것들"을 넣는 작업이었다.

---

## T6: 무기 8종 전면 재구현

Phase 5까지 보상 무기 5종이 추가됐는데, 막상 써보면 개성이 없었다. SQL은 "세로 3줄기"인데 방향이 위 고정이고, JavaScript는 그냥 랜덤 5방향이라 조작감이 없다.

각 언어 이미지에서 컨셉을 다시 뽑았다.

### 시작 무기 3종

**Python — 유도탄**
- Python의 이미지: 자동화, 추적
- 3발을 30도씩 펼쳐 발사, 각 투사체에 `homing: true` 플래그
- 매 프레임 가장 가까운 적 방향으로 최대 3rad/s 각도 조정
- 색상: `#ffe066` (노란색)

**C/C++ — 고속 관통**
- C의 이미지: 저수준, 빠름, 제어
- 단발 관통 탄환 `piercing: true`, 속도 600, 쿨 0.3s
- 적 충돌 시 제거되지 않고 통과 (hitEnemies Set으로 중복 피격 방지)
- 색상: `#aaaaaa` (회색)

**Java — 궤도 오브 (유지)**
- 현재 구조는 개성 있어서 그대로 두되, 색상 `#ff6600` 주황, 데미지 18로 조정

### 보상 무기 5종

**Git — 분기 폭발**
- Git의 이미지: 분기(branch), 머지
- 폭발 투사체 1개(반경 150, 데미지 40) + 8방향 잔여 투사체 8발(데미지 15)
- 쿨 3s, 색상: `#f05033` (Git 로고 주황)

**SQL — SELECT 레이저**
- SQL의 이미지: 정밀 쿼리
- 마우스 방향 단발 관통 레이저, 속도 800, 데미지 35, 쿨 4s
- 색상: `#4499ff` (파란색)

**JavaScript — 비동기 버스트**
- JS의 이미지: 비동기, 예측 불가
- 랜덤 방향 3발, 쿨 0.6s, 데미지 12
- 색상: `#f7df1e` (JS 로고 노란색)

**Django — MTV 샷건**
- Django의 이미지: 모델-뷰-템플릿, 세 갈래
- 전방 부채꼴 7발(±60도), 근거리 특화, 쿨 1.5s
- 색상: `#092e20` (Django 짙은 초록)

**Linux/Bash — 터미널 낙뢰**
- Bash의 이미지: 전체 시스템 제어
- 투사체 없이 `isAllEnemy: true` 시그널. main.js에서 현재 모든 적에게 데미지 30 즉시 적용
- 쿨 6s

`Projectile.js`에 `color`, `homing`, `piercing`, `isAreaEffect`, `isAllEnemy` 필드를 추가하고, render 시 `this.color` 사용하도록 변경했다. 각 무기별 테스트도 새 설계 기준으로 전면 교체했다.

---

## T7: Screen Shake

적을 맞힐 때 타격감이 없었다. 시각적으로 뭔가 터지는 느낌이 없으니 무기를 쓰는 재미가 반감됐다.

`main.js`에 `screenShake` 상태 추가:

```js
let screenShake = { intensity: 0, duration: 0 };

function triggerScreenShake(intensity, duration) {
  screenShake.intensity = Math.max(screenShake.intensity, intensity);
  screenShake.duration = Math.max(screenShake.duration, duration);
}
```

render 함수 최상단에서 카메라 translate 전에 흔들림 적용:

```js
if (screenShake.duration > 0) {
  const ratio = screenShake.duration;
  const dx = (Math.random() - 0.5) * 2 * screenShake.intensity * ratio;
  const dy = (Math.random() - 0.5) * 2 * screenShake.intensity * ratio;
  ctx.translate(dx, dy);
}
```

- 일반 적 피격: intensity=3, duration=0.1초
- 보스 피격: intensity=6, duration=0.15초

여러 피격이 겹쳐도 최대값을 유지하도록 설계했다.

---

## T8: 플로팅 텍스트 이펙트

적을 처치했을 때 피드백이 없었다. 소리도 없고 시각적 반응도 없다 보니 처치했는지 모르고 지나치는 경우가 있었다.

`ui/FloatingText.js` 신규 파일로 `FloatingTextManager` 클래스를 만들었다:

```js
add(text, x, y, color = '#ffffff') {
  this.texts.push({ text, x, y, color, life: 1.0, maxLife: 1.0 });
}

render(ctx, cameraX, cameraY) {
  for (const t of this.texts) {
    const alpha = t.life / t.maxLife;
    const offsetY = (1 - alpha) * 30; // 위로 30px 이동
    ctx.globalAlpha = alpha;
    ctx.fillText(t.text, t.x - cameraX, t.y - cameraY - offsetY);
  }
}
```

- 일반 적 처치: `"Bug Fixed!"` / `"Error Resolved!"` 랜덤, 흰색, 처치 위치
- 보스 처치: `"BOSS DEFEATED!"`, 금색 `#ffd700`, 화면 중앙

1초 동안 위로 떠오르며 페이드아웃된다.

---

## T9: 플레이어 아웃라인 + 보스 저체력 강조

**플레이어 아웃라인**

배경이 어두운 색이다 보니 플레이어가 묻히는 경우가 있었다. 특히 적들 사이에 껴있을 때 어디 있는지 구분이 안 된다.

`PixelRenderer.drawSpriteWithOutline`을 추가했다. 스프라이트 각 픽셀의 4방향에 먼저 아웃라인 색을 칠한 뒤 본체를 덮어 그린다:

```js
// 아웃라인 먼저
ctx.fillStyle = outlineColor; // '#00ffcc'
ctx.fillRect(px - 1, py, scale + 2, scale); // 좌우
ctx.fillRect(px, py - 1, scale, scale + 2); // 상하
// 본체
ctx.fillStyle = color;
ctx.fillRect(px, py, scale, scale);
```

청록색(`#00ffcc`) 테두리가 생기니 어두운 배경에서도 플레이어 위치가 명확히 보인다.

**보스 저체력 강조**

보스 HP가 25% 이하가 되면 빨간 점선 테두리를 추가했다:

```js
if (this.hp > 0 && this.hp <= this.maxHp * 0.25) {
  ctx.strokeStyle = '#ff0000';
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bossX - 2, bossY - 2, width + 4, height + 4);
}
```

HP바 색상이 이미 빨갛게 변해 있는 상황에서 테두리까지 깜박이면 "위기 상황"임을 더 직관적으로 전달한다.

---

## 마치며

Cycle 2는 "있으면 좋은 것들"이 아니라 "없으면 아쉬운 것들"이었다. Screen Shake 하나만 들어가도 타격감이 완전히 달라진다. 플로팅 텍스트도 처음엔 별거 아닌 것 같았는데 없으니까 허전하다는 걸 추가하고 나서야 느꼈다.

이제 Phase 6 Cycle 1(수정)과 Cycle 2(추가)가 모두 완료됐다. Phase 6 자체는 마무리 단계다.
