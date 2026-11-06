/** セル分割で除かれるエスケープと空白を考慮し、各文字を原文の位置へ対応づける。 */
export const markdownTableCellPositions = (line: string, offset: number) => {
  const trimmed = line.trim()
  const start = line.indexOf(trimmed)
  const end = start + trimmed.length
  const cells: number[][] = []
  let positions: number[] = []

  for (let index = start; index < end; index++) {
    if (line[index] === '|') {
      if (line[index - 1] !== '\\') {
        cells.push(positions)
        positions = []

        continue
      }

      // markdown-it の表と同じく、パイプ直前のバックスラッシュを 1 文字除く。
      positions.pop()
    }

    positions.push(offset + index)
  }

  cells.push(positions)

  if (cells[0]?.length === 0) cells.shift()
  if (cells.at(-1)?.length === 0) cells.pop()

  return cells.map(positions => {
    const content = positions.map(position => line[position - offset]).join('')

    return positions.slice(
      content.length - content.trimStart().length,
      content.trimEnd().length
    )
  })
}
