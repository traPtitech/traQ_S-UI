export interface Point {
  x: number
  y: number
}

export const diff = (p: Point, q: Point) => ({
  x: p.x - q.x,
  y: p.y - q.y
})
