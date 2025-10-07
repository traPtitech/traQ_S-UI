import type { Point } from '../basic/point'

type ArcOptions = {
  readonly angle?: number
  readonly large?: boolean
  readonly sweep?: boolean
}

export class SvgPathBuilder {
  private path: string[] = []

  moveTo({ x, y }: Point): this {
    this.path.push(`M ${x} ${y}`)
    return this
  }

  lineTo({ x, y }: Point): this {
    this.path.push(`L ${x} ${y}`)
    return this
  }

  verticalLineTo(y: number): this {
    this.path.push(`V ${y}`)
    return this
  }

  horizontalLineTo(x: number): this {
    this.path.push(`H ${x}`)
    return this
  }

  curveTo(p0: Point, p1: Point, p2: Point): this {
    this.path.push(`C ${p0.x} ${p0.y}, ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`)
    return this
  }

  cureveToRelative(p0: Point, p1: Point, p2: Point): this {
    this.path.push(`c ${p0.x} ${p0.y}, ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`)
    return this
  }

  shorthandCurveTo(p1: Point, p2: Point): this {
    this.path.push(`S ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`)
    return this
  }

  shorthandCurveToRelative(p1: Point, p2: Point): this {
    this.path.push(`s ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`)
    return this
  }

  quadraticCurveTo(p0: Point, p1: Point): this {
    this.path.push(`Q ${p0.x} ${p0.y}, ${p1.x} ${p1.y}`)
    return this
  }

  quadraticCurveToRelative(p0: Point, p1: Point): this {
    this.path.push(`q ${p0.x} ${p0.y}, ${p1.x} ${p1.y}`)
    return this
  }

  shorthandQuadraticCurveTo(p: Point): this {
    this.path.push(`T ${p.x} ${p.y}`)
    return this
  }

  shorthandQuadraticCurveToRelative(p: Point): this {
    this.path.push(`t ${p.x} ${p.y}`)
    return this
  }

  arcTo(
    radius: Point,
    to: Point,
    { angle = 0, large = false, sweep = false }: ArcOptions = {}
  ): this {
    this.path.push(
      `A ${radius.x} ${radius.y} ${angle} ${+large} ${+sweep} ${to.x} ${to.y}`
    )
    return this
  }

  arcToRelative(
    radius: Point,
    to: Point,
    { angle = 0, large = false, sweep = false }: ArcOptions = {}
  ): this {
    this.path.push(
      `a ${radius.x} ${radius.y} ${angle} ${+large} ${+sweep} ${to.x} ${to.y}`
    )
    return this
  }

  closePath(): this {
    this.path.push('Z')
    return this
  }

  build(): string {
    return this.path.join(' ')
  }
}
