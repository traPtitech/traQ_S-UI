import { forEachData, Position } from './detector'

export const replaceBack = (text: string) => {
  const internalLinks: Array<Position & { newText: string }> = []
  forEachData(text, (data, position) => {
    if (!data) return

    internalLinks.push({ ...position, newText: data.raw })
  })

  let newText = text
  let shortenedLength = 0
  internalLinks.forEach(pos => {
    const prefix = newText.slice(0, pos.start + shortenedLength)
    const suffix = newText.slice(pos.start + shortenedLength + pos.length)

    newText = `${prefix}${pos.newText}${suffix}`
    shortenedLength += pos.newText.length - pos.length
  })

  return newText
}
