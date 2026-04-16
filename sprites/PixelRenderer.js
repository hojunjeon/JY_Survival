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

// ─── 버그 픽셀 스프라이트 (16×16, scale=2 렌더 시 32×32) ──────────────────

// SyntaxError: 빨간 타원형 몸체 + 흰색 느낌표
const _SE = null, SR = '#cc2200', SL = '#ff4422', SW = '#ffffff';
const SYNTAX_ERROR_SPRITE = [
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE, SR, SR, SR, SR, SR, SR, SR, SR,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SR, SL, SL, SL, SL, SL, SL, SR, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SW, SW, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SW, SW, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SW, SW, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SL, SL, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SW, SW, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SL, SL, SL, SW, SW, SL, SL, SL, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE, SR, SR, SL, SL, SL, SL, SL, SL, SR, SR,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE, SR, SR, SR, SR, SR, SR, SR, SR,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
  [_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE,_SE],
];

// NullPointer: 반투명 유령
const _NP = null, NG = '#ccccee', NE = '#000022';
const NULL_POINTER_SPRITE = [
  [_NP,_NP,_NP,_NP, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NE, NE, NG, NG, NE, NE, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NE, NE, NG, NG, NE, NE, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP],
  [_NP,_NP, NG, NG, NG, NG, NG, NG, NG, NG, NG, NG,_NP,_NP,_NP,_NP],
  [_NP, NG, NG,_NP, NG, NG, NG,_NP, NG, NG, NG,_NP, NG,_NP,_NP,_NP],
  [_NP, NG,_NP,_NP,_NP, NG, NG,_NP,_NP, NG, NG,_NP, NG,_NP,_NP,_NP],
  [_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP],
  [_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP,_NP],
];

// SegFault: 갈색 육각형 + 균열선
const _SF = null, SFB = '#884400', SFO = '#cc6600', SFC = '#ffaa55';
const SEG_FAULT_SPRITE = [
  [_SF,_SF,_SF,_SF,SFB,SFB,SFB,SFB,SFB,SFB,SFB,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,SFB,SFO,SFO,SFO,SFO,SFO,SFO,SFB,SFB,_SF,_SF,_SF,_SF],
  [_SF,_SF,SFB,SFO,SFO,SFC,SFO,SFO,SFO,SFO,SFO,SFB,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFO,SFC,SFO,SFO,SFO,SFO,SFO,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFC,SFB,SFB,SFO,SFO,SFO,SFC,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFO,SFO,SFB,SFO,SFO,SFC,SFO,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFO,SFO,SFO,SFB,SFC,SFO,SFO,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFO,SFC,SFO,SFO,SFB,SFO,SFO,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,SFB,SFO,SFO,SFO,SFC,SFO,SFO,SFB,SFO,SFO,SFO,SFB,_SF,_SF,_SF],
  [_SF,_SF,SFB,SFO,SFO,SFO,SFO,SFO,SFO,SFB,SFB,SFB,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,SFB,SFB,SFB,SFB,SFB,SFB,SFB,_SF,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF],
  [_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF,_SF],
];

// HealBug: 녹색 하트
const _HB = null, HG = '#22cc44', HD = '#118822';
const HEAL_BUG_SPRITE = [
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB, HG, HG, HG,_HB, HG, HG, HG,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB, HG, HG, HG, HG, HG, HG, HG, HG, HG,_HB,_HB,_HB,_HB],
  [_HB,_HB, HG, HG, HG, HD, HG, HG, HD, HG, HG, HG, HG,_HB,_HB,_HB],
  [_HB,_HB, HG, HG, HG, HG, HG, HG, HG, HG, HG, HG, HG,_HB,_HB,_HB],
  [_HB,_HB, HG, HG, HG, HG, HG, HG, HG, HG, HG, HG, HG,_HB,_HB,_HB],
  [_HB,_HB,_HB, HG, HG, HG, HG, HG, HG, HG, HG, HG,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB, HG, HG, HG, HG, HG, HG, HG,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB, HG, HG, HG, HG, HG,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB, HG, HG, HG,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB, HG,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
  [_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB,_HB],
];

// IndentationError: 주황 배경 + 들여쓰기 막대
const _IE = null, IO = '#ff8800', ID = '#cc5500', IW = '#ffffff';
const INDENTATION_ERROR_SPRITE = [
  [_IE, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, IW, IW, IW, IW, IW, IW, IW, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, IW, IW, IW, IW, IW, IW, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, IW, IW, IW, IW, IW, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, IW, IW, IW, IW, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, ID, IO,_IE,_IE],
  [_IE, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO, IO,_IE,_IE],
  [_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE],
  [_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE],
  [_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE],
  [_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE],
  [_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE,_IE],
];

// EnvError: 파란 배경 + 노란 경고 삼각형
const _EE = null, EB = '#2255cc', EY = '#ffee00', EW = '#ffffff';
const ENV_ERROR_SPRITE = [
  [_EE, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EB, EB, EY, EB, EB, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EB, EY, EY, EY, EB, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EY, EY, EW, EY, EY, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EY, EY, EW, EY, EY, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EY, EY, EW, EY, EY, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EY, EY, EY, EY, EY, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EY, EY, EW, EY, EY, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EY, EY, EY, EY, EY, EY, EY, EB, EB, EB,_EE,_EE,_EE],
  [_EE, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB, EB,_EE,_EE,_EE],
  [_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE],
  [_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE],
  [_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE],
  [_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE],
  [_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE,_EE],
];

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
  BUG_SPRITES: {
    syntax_error:      SYNTAX_ERROR_SPRITE,
    null_pointer:      NULL_POINTER_SPRITE,
    seg_fault:         SEG_FAULT_SPRITE,
    heal_bug:          HEAL_BUG_SPRITE,
    indentation_error: INDENTATION_ERROR_SPRITE,
    env_error:         ENV_ERROR_SPRITE,
  },

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
