import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../entities/Player.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player(400, 300);
  });

  it('초기 HP는 100이다', () => {
    expect(player.hp).toBe(100);
  });

  it('초기 위치를 생성자에서 설정한다', () => {
    expect(player.x).toBe(400);
    expect(player.y).toBe(300);
  });

  it('충돌박스는 32×32이다', () => {
    expect(player.width).toBe(32);
    expect(player.height).toBe(32);
  });

  it('오른쪽 이동 시 x가 증가한다', () => {
    player.vx = player.speed;
    player.update(1);
    expect(player.x).toBeGreaterThan(400);
  });

  it('왼쪽 이동 시 x가 감소한다', () => {
    player.vx = -player.speed;
    player.update(1);
    expect(player.x).toBeLessThan(400);
  });

  it('위쪽 이동 시 y가 감소한다', () => {
    player.vy = -player.speed;
    player.update(1);
    expect(player.y).toBeLessThan(300);
  });

  it('아래쪽 이동 시 y가 증가한다', () => {
    player.vy = player.speed;
    player.update(1);
    expect(player.y).toBeGreaterThan(300);
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
    expect(player.hp).toBe(100);
  });

  it('heal로 HP가 회복된다', () => {
    player.takeDamage(30);
    player.heal(10);
    expect(player.hp).toBe(80);
  });

  it('기본 이동속도(speed)는 양수다', () => {
    expect(player.speed).toBeGreaterThan(0);
  });
});
