import Turndown from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

export const setupTurndown = () => {
  const turndown = new Turndown({
    headingStyle: 'atx',
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
  td.addRule('url titled link', {
    filter: node => !!(node.nodeName === 'A' && node.getAttribute('href')),
    replacement: (content, node) => {
      const href = (node as HTMLElement).getAttribute('href')

      if (!content || href === content.trim()) {
        return href ?? ''
      }
      return `[${content}](${href})`
    }
  })

  td.addRule('mark', {
    filter: ['mark'],
    replacement: content => `==${content}==`
  })

  td.remove(['style', 'script'])
}
