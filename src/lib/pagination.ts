import { unique } from './basic/array'

interface Options {
  exponentialBegin?: number
  exponentialBase?: number
}

export const generateNavigatorLabels = (
  current: number,
  last: number,
  { exponentialBegin = 2, exponentialBase = 2 }: Options = {}
) => {
  if (current < 0 || current >= last) {
    throw new Error(`current page (${current}) is out of range (0..${last})`)
  }

  const candidates: number[] = [0, last - 1]

  Array.from(Array(exponentialBegin).keys()).forEach(i => {
    candidates.push(current - i)
    candidates.push(current + i)
  })

  for (
    let p = exponentialBegin, v;
    (v = current - p) >= 0;
    p *= exponentialBase
  ) {
    candidates.push(v)
  }

  for (
    let p = exponentialBegin, v;
    (v = current + p) < last;
    p *= exponentialBase
  ) {
    candidates.push(v)
  }

  return unique(
    candidates.sort((a, b) => a - b).filter(v => 0 <= v && v < last)
  )
}
