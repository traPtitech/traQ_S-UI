import { analyzeMarkdownSource } from '/@/lib/markdown/analysis'

import { markdownCorpus } from '../../fixtures/markdownCorpus'

it.each(markdownCorpus)(
  'maps the supported syntax without dropping ranges in corpus $name',
  ({ source }) => {
    const { nodes } = analyzeMarkdownSource(source)
    const mapped = nodes.map(node => source.slice(node.from, node.to))
    expect(mapped).toEqual(
      expect.arrayContaining([
        '**bold**',
        '_em_',
        '~~strike~~',
        '==mark==',
        '!!hidden!!',
        '`code`',
        '$x^2$',
        ':test:',
        '![image][asset]',

        '**table**'
      ])
    )

    for (const node of nodes) {
      expect(node.from).toBeGreaterThanOrEqual(0)
      expect(node.to).toBeLessThanOrEqual(source.length)
      for (const range of node.content) {
        expect(range.from).toBeGreaterThanOrEqual(node.from)
        expect(range.to).toBeGreaterThanOrEqual(range.from)
        expect(range.to).toBeLessThanOrEqual(node.to)
      }

      for (const range of node.syntax) {
        expect(range.from).toBeGreaterThanOrEqual(node.from)
        expect(range.to).toBeGreaterThanOrEqual(range.from)
        expect(range.to).toBeLessThanOrEqual(node.to)
      }
    }
  }
)
