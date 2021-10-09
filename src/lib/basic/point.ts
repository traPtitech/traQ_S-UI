export interface Point {
  x: number
  y: number
}

export type Line = readonly [Point, Point]

export const diff = (p: Point, q: Point) => ({
  x: p.x - q.x,
  y: p.y - q.y
})

export const getDistance = (p: Point, q: Point) =>
  Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2)

const getAverage = (ns: number[]) =>
  ns.reduce((acc, n) => acc + n, 0) / ns.length

/**
 * 与えられた点の重心を返す
 * 二点の場合はその中点に一致する
 */
export const getMidpoint = (...ps: readonly Point[]) => ({
  x: getAverage(ps.map(p => p.x)),
  y: getAverage(ps.map(p => p.y))
})

/**
 * 与えられたベクトルとx軸のなす角を返す
 * @returns 角度(-180～180)
 */
export const getAngle = (p: Point) => (Math.atan2(p.y, p.x) * 180) / Math.PI

/**
 * 与えられた二点から作られるベクトルとx軸のなす角を返す
 */
export const getAngleOfLine = ([start, end]: Line) => getAngle(diff(start, end))

/**
 * 与えられた二つの直線のなす角を返す
 */
export const getAngleBetweenLines = (l1: Line, l2: Line) =>
  getAngleOfLine(l1) - getAngleOfLine(l2)
