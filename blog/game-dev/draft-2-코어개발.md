# [JY Survival #2] 게임 루프부터 픽셀 아트까지 — 코어 시스템 구현기

> 이 시리즈는 Superpowers + GSD + Gstack 워크플로우를 실제 게임 토이 프로젝트를 통해 검증하는 개발일지다.

---

## 저번 편에서 기획을 마쳤으니 이제 코드다

솔직히 말하면, 기획 끝내고 나서 잠깐 막막했다.

해야 할 게 명확히 있는데 어디서부터 시작하냐가 문제였다. `index.html`부터? `Player.js`부터? `Game.js`부터?

결국 TDD 방식으로 접근하기로 했다. **테스트를 먼저 쓰고, 그걸 통과시키는 코드를 최소한으로 작성한다.** 어디서부터 시작할지 모를 때 테스트부터 쓰는 게 오히려 방향이 잡힌다.

이번 Cycle 1에서 만든 것들:

```
core/Game.js       — requestAnimationFrame 게임 루프
core/Input.js      — WASD 키보드 입력
core/Canvas.js     — 렌더링 유틸
entities/Player.js — 이동 + HP + 충돌박스
sprites/PixelRenderer.js — 김지윤 32×32 픽셀 스프라이트
index.html + main.js
```

총 34개 테스트, 전부 GREEN.

---

## 테스트 환경 먼저

Vanilla JS + HTML5 Canvas인데 테스트를 어떻게 하냐는 생각이 들 수 있다.

jsdom이 있다. Node.js 환경에서 DOM과 Canvas API를 흉내내주는 라이브러리다. Vitest와 조합하면 브라우저 없이도 Canvas 관련 코드를 테스트할 수 있다.

```js
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Canvas API 메서드들은 `vi.fn()`으로 모킹했다. 예를 들어 `clearRect`가 올바른 인자로 호출됐는지, `fillRect`가 몇 번 호출됐는지 이런 식으로 검증한다.

---

## Player.js — 가장 먼저 테스트를 썼다

플레이어 로직은 순수한 상태 관리라 테스트 쓰기 제일 좋았다.

```js
// tests/Player.test.js 에서 일부 발췌
it('초기 HP는 100이다', () => {
  expect(player.hp).toBe(100);
});

it('데미지를 받으면 HP가 줄어든다', () => {
  player.takeDamage(20);
  expect(player.hp).toBe(80);
});

it('HP가 0 이하가 되면 isDead가 true가 된다', () => {
  player.takeDamage(100);
  expect(player.isDead).toBe(true);
});

it('HP는 최대 HP를 초과할 수 없다', () => {
  player.heal(50);
  expect(player.hp).toBe(100); // 이미 100이니까 그대로
});
```

이걸 먼저 쓰고 나서 Player.js 구현을 시작했다.

```js
export class Player {
  constructor(x, y, renderer = null) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 160; // px/s
    this.maxHp = 100;
    this.hp = 100;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this._renderer = renderer;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}
```

`Math.max(0, ...)`, `Math.min(this.maxHp, ...)` — HP 경계 처리를 자연스럽게 하게 됐는데, 테스트가 없었으면 "대충 빼면 되겠지" 하고 지나쳤을 것 같다.

### renderer DI

처음엔 `Player.render()`에 파란 사각형 그리는 코드를 직접 넣었다가 나중에 픽셀 스프라이트로 교체하면서 난감해졌다.

해결책은 `renderer`를 생성자에 주입하는 방식이었다.

```js
render(ctx) {
  if (this._renderer) {
    this._renderer.draw(ctx, this.x, this.y);
  } else {
    // 개발/테스트 폴백
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(...);
  }
}
```

`main.js`에서는 이렇게 쓴다:

```js
const playerRenderer = {
  draw(ctx, x, y) {
    PixelRenderer.drawPlayer(ctx, x, y, 2);
  },
};
const player = new Player(canvas.width / 2, canvas.height / 2, playerRenderer);
```

테스트에서는 renderer 없이 `new Player(400, 300)` 하면 폴백 렌더러가 동작한다. 테스트가 PixelRenderer에 의존할 필요가 없어진다.

---

## Input.js — 대각선 이동의 함정

WASD 입력 구현은 쉬워 보이지만 한 가지 함정이 있다.

W + D를 동시에 누르면 대각선 이동인데, 이때 벡터의 길이가 `√2 ≈ 1.41`이 된다. 그냥 두면 대각선 이동이 45% 빨라지는 버그다.

```js
getAxis() {
  let x = 0;
  let y = 0;

  if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
  if (this.isDown('KeyA') || this.isDown('ArrowLeft'))  x -= 1;
  if (this.isDown('KeyS') || this.isDown('ArrowDown'))  y += 1;
  if (this.isDown('KeyW') || this.isDown('ArrowUp'))    y -= 1;

  const len = Math.sqrt(x * x + y * y);
  if (len > 0) {
    x /= len;
    y /= len;
  }

  return { x, y };
}
```

정규화하면 대각선도 직선과 같은 속도가 된다. 이 부분은 테스트로 명시적으로 잡았다:

```js
it('getAxis 대각선은 정규화(길이 1)된다', () => {
  input.onKeyDown({ code: 'KeyD' });
  input.onKeyDown({ code: 'KeyS' });
  const { x, y } = input.getAxis();
  const len = Math.sqrt(x * x + y * y);
  expect(len).toBeCloseTo(1, 5);
});
```

그리고 메모리 리크도 있었다. `listen()`으로 이벤트 리스너를 붙이는데 `unlisten()`이 없으면 게임 재시작할 때 리스너가 누적된다. 코드 리뷰에서 걸렸다.

```js
listen(target = window) {
  this._target = target;
  this._boundDown = e => this.onKeyDown(e);
  this._boundUp   = e => this.onKeyUp(e);
  target.addEventListener('keydown', this._boundDown);
  target.addEventListener('keyup',   this._boundUp);
}

unlisten() {
  if (this._target) {
    this._target.removeEventListener('keydown', this._boundDown);
    this._target.removeEventListener('keyup',   this._boundUp);
    this._target = null;
  }
}
```

---

## Game.js — requestAnimationFrame과 dt

게임 루프의 핵심은 **dt(delta time)**다. 프레임마다 얼마만큼 시간이 지났는지를 계산해서 이걸 기준으로 이동 거리를 계산한다.

60fps면 dt ≈ 0.016초, 30fps면 dt ≈ 0.033초. 어떤 환경에서도 플레이어가 같은 속도로 움직이려면 `vx * dt`로 이동해야 한다. `vx`만 더하면 fps가 낮을수록 느리게 움직인다.

```js
_loop(timestamp) {
  if (!this.running) return;
  const dt = Math.max(0.0001, Math.min((timestamp - this._lastTime) / 1000, 0.05));
  this._lastTime = timestamp;
  this.update(dt);
  this.render();
  this._rafId = requestAnimationFrame(ts => this._loop(ts));
}
```

`Math.min(..., 0.05)` — 탭 전환하거나 브레이크포인트 걸면 dt가 수 초가 될 수 있다. 50ms로 상한을 걸어서 물리 계산이 폭주하는 걸 막는다.

`Math.max(0.0001, ...)` — 반대로 dt가 0이 되는 엣지케이스 방지. 이건 코드 리뷰에서 잡혔다.

엔티티 관리도 단순하게:

```js
addEntity(entity) {
  this.entities.push(entity);
}

removeEntity(entity) {
  const idx = this.entities.indexOf(entity);
  if (idx > -1) this.entities.splice(idx, 1);
}
```

처음엔 `filter()`로 했다가 O(n)→O(1)로 바꿨다. 적이 수십 마리 죽는 순간에 매 프레임 배열 새로 만들면 GC 부하가 생긴다.

---

## 픽셀 아트 — 김지윤을 32×32에 담는다

솔직히 이게 제일 재밌었다.

Canvas API로 픽셀 아트를 그리는 원리는 단순하다. 32×32 배열에 색상 코드를 넣고, null이면 투명, 색상이면 그 크기만큼 `fillRect`를 호출한다.

```js
const _ = null;   // 투명
const S = '#f5c5a3';   // 피부
const H = '#3d2314';   // 머리카락
const U = '#4a90d9';   // SSAFY 블루 유니폼
const G = '#2dc653';   // 노트북 화면 (그린)
const K = '#222222';   // 노트북 바디

const PLAYER_SPRITE = [
  // 머리 위
  [_,_,_,_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,_,...],
  // ... 32행
];
```

그리고:

```js
drawSprite(ctx, sprite, x, y, scale = 1) {
  ctx.save();
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (color === null) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
  ctx.restore();
}
```

`scale = 2`로 그리면 64×64로 확대된다. `image-rendering: pixelated` CSS 속성이랑 같이 쓰면 흐릿해지지 않는다.

김지윤 캐릭터는: 다크 브라운 단발머리, SSAFY 블루 유니폼, 노트북 들고 있음. 노트북 화면은 초록색으로 켜져 있다. 32픽셀 안에서 할 수 있는 최선을 다했다.

---

## 코드 리뷰에서 걸린 것들

Gstack 코드 리뷰 단계에서 Critical 이슈 3개가 나왔다.

1. **Input 메모리 리크** — `unlisten()` 없음. 위에서 수정했다.
2. **Player 렌더 아키텍처** — main.js에서 monkey-patching으로 render를 갈아끼우고 있었는데, 이게 단일 책임 원칙 위반이었다. renderer DI로 해결.
3. **dt 최솟값 없음** — `Math.max(0.0001, ...)` 한 줄 추가.

코드 리뷰 없었으면 2번은 그냥 지나쳤을 것 같다. 동작하긴 하니까. 근데 Cycle 2에서 Enemy, Boss가 붙기 시작하면 구조가 꼬일 게 뻔했다.

---

## 현재 상태

```
$ npx vitest run

✓ tests/Input.test.js      (7 tests)
✓ tests/Player.test.js    (12 tests)
✓ tests/Canvas.test.js     (4 tests)
✓ tests/Game.test.js       (7 tests)
✓ tests/PixelRenderer.test.js (4 tests)

Test Files  5 passed (5)
Tests      34 passed (34)
```

브라우저에서 `npx serve .` 하고 열면 김지윤이 WASD로 움직인다.

---

## 다음 편

Cycle 2 — 적 시스템.

SyntaxError, NullPointerException, SegFault, 회복 버그. 그리고 웨이브 스폰 시스템.

플레이어를 향해 달려오는 것들이 생기면 게임답게 느껴지기 시작한다.
