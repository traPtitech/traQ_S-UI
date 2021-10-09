import type Turndown from 'turndown'

let _turndown: Turndown | undefined
const getTurndown = async () => {
  if (_turndown) return _turndown

  const { setupTurndown } = await import('./turndown')
  _turndown = setupTurndown()
  return _turndown
}

export const generateMarkdownFromHtml = async (html: string) => {
  const turndown = await getTurndown()

  return turndown.turndown(html)
}
