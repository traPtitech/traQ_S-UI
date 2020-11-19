export interface Point {
  x: number
  y: number
}

export const diff = (p: Point, q: Point) => ({
  x: p.x - q.x,
  y: p.y - q.y
})

export const getDistance = ([p, q]: readonly [Point, Point]) =>
  Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2)

const getAverage = (ns: number[]) =>
  ns.reduce((acc, n) => acc + n, 0) / ns.length

export const getMidpoint = (ps: readonly Point[]) => ({
  x: getAverage(ps.map(p => p.x)),
  y: getAverage(ps.map(p => p.y))
})

export const getAngle = (p: Point) => (Math.atan2(p.y, p.x) * 180) / Math.PI

export const getAngleOfLine = (line: readonly [Point, Point]) =>
  getAngle(diff(line[0], line[1]))

export const getAngleBetweenLines = (
  l1: readonly [Point, Point],
  l2: readonly [Point, Point]
) => getAngleOfLine(l1) - getAngleOfLine(l2)
