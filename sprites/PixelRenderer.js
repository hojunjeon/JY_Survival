// 색상 팔레트
const _ = null;   // 투명
const S = '#f5c5a3';   // 피부
const H = '#3d2314';   // 머리카락 (다크 브라운)
const E = '#1a1a1a';   // 눈/눈썹
const L = '#e8a87c';   // 피부 (그림자)
const U = '#4a90d9';   // 유니폼 상의 (SSAFY 블루)
const B = '#2c5f8a';   // 유니폼 어두운 부분
const P = '#1e3f5a';   // 바지
const W = '#ffffff';   // 흰색
const G = '#2dc653';   // 노트북 화면 (그린)
const K = '#222222';   // 노트북 바디

// 김지윤 32×32 픽셀 아트 (정면)
const PLAYER_SPRITE = [
  // 0-3: 머리 위
  [_,_,_,_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,H,H,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,H,H,H,H,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,_,_,_,_,_,_,_,_],
  // 4-7: 얼굴 상단
  [_,_,_,_,_,_,_,H,H,S,S,S,S,S,S,S,S,S,S,S,S,H,H,H,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,H,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,_,_,_,_,_,_,_],
  // 8-11: 눈 영역
  [_,_,_,_,_,_,H,S,S,E,E,S,S,S,S,S,S,S,S,E,E,S,S,S,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,S,S,E,W,S,S,S,S,S,S,S,S,E,W,S,S,S,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,_,_,_,_,_,_,_],
  // 12-15: 코/입
  [_,_,_,_,_,_,H,S,S,S,S,S,L,S,S,S,S,L,S,S,S,S,S,S,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,H,H,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,H,S,S,S,E,E,E,E,E,E,E,E,E,S,S,S,H,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,H,H,S,S,S,S,S,S,S,S,S,S,S,S,H,H,_,_,_,_,_,_,_,_,_],
  // 16-19: 목 / 어깨
  [_,_,_,_,_,_,_,_,_,H,H,H,H,H,H,H,H,H,H,H,H,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,S,S,S,S,S,S,S,S,S,S,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,U,U,U,S,S,S,S,S,S,S,S,U,U,U,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,_,_,_,_,_,_,_,_,_],
  // 20-25: 상의 몸통 (노트북 들고 있음)
  [_,_,_,_,_,_,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,U,U,B,U,U,W,W,W,W,W,W,W,W,U,U,B,U,U,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,U,U,B,U,K,K,K,K,K,K,K,K,K,K,U,B,U,U,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,U,U,B,U,K,G,G,G,G,G,G,G,G,K,U,B,U,U,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,U,U,B,U,K,G,G,G,G,G,G,G,G,K,U,B,U,U,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,U,_,_,_,_,_,_,_,_,_],
  // 26-27: 허리 / 하의 시작
  [_,_,_,_,_,_,_,P,P,P,P,P,_,_,_,_,_,_,P,P,P,P,P,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,P,P,P,P,P,_,_,_,_,_,_,P,P,P,P,P,_,_,_,_,_,_,_,_,_],
  // 28-31: 다리 / 발
  [_,_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,E,E,P,P,_,_,_,_,_,_,_,_,P,P,E,E,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,E,E,E,_,_,_,_,_,_,_,_,_,_,E,E,E,_,_,_,_,_,_,_,_,_],
];

export const PixelRenderer = {
  PLAYER_SPRITE,

  drawSprite(ctx, sprite, x, y, scale = 1) {
    ctx.save();
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const color = sprite[row][col];
        if (color === null || color === undefined) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
    ctx.restore();
  },

  drawPlayer(ctx, x, y, scale = 1) {
    this.drawSprite(ctx, PLAYER_SPRITE, x - (32 * scale) / 2, y - (32 * scale) / 2, scale);
  },
};
