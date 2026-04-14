/**
 * AABB 충돌 감지. x, y는 중심 좌표.
 * @param {{ x: number, y: number, width: number, height: number }} a
 * @param {{ x: number, y: number, width: number, height: number }} b
 * @returns {boolean}
 */
export function checkCollision(a, b) {
  const aLeft   = a.x - a.width  / 2;
  const aRight  = a.x + a.width  / 2;
  const aTop    = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft   = b.x - b.width  / 2;
  const bRight  = b.x + b.width  / 2;
  const bTop    = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  return aRight > bLeft && aLeft < bRight && aBottom > bTop && aTop < bBottom;
}
