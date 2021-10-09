import Turndown from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

export const setupTurndown = () => {
  const turndown = new Turndown({
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  })
  turndown.use(gfm)
  setTurndownRules(turndown)
  return turndown
}

const setTurndownRules = (td: Turndown) => {
  td.addRule('mark', {
    filter: ['mark'],
    replacement: content => `==${content}==`
  })
}
