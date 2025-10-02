export const generateNavigatorLabels = (current: number, last: number) => {
  if (current < 0 || current >= last) {
    throw new Error(`current page (${current}) is out of range (0..${last})`)
  }

  const delta = 1
  const length = 2 * (delta + 2) + 1

  if (last <= length) {
    return [...Array(last).keys()]
  }

  const range = new Set<number>([0, last - 1])

  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 0 && i < last) range.add(i)
  }
  const values: (number | null)[] = [...range].sort((a, b) => a - b)

  if ((values[1] as number) - (values[0] as number) > 1) {
    values.splice(1, 0, null)
  }

  if ((values.at(-1) as number) - (values.at(-2) as number) > 1) {
    values.splice(-1, 0, null)
  }

  return values
}
