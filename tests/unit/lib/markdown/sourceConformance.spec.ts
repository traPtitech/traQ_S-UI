import { analyzeMarkdownSource } from '/@/lib/markdown/analysis'
import { trackMarkdownSource } from '/@/lib/markdown/compatibility/source'
import { markdownLineContexts } from '/@/lib/markdown/lineContexts'
import {
  type SourceMappingDiagnostic,
  collectSourceNodes
} from '/@/lib/markdown/sourceNodes'
import { createMarkdownAnalysisParser } from '/@/lib/markdown/syntax'

import { markdownCorpus } from '../../fixtures/markdownCorpus'

it.each(markdownCorpus.map((source, index) => ({ source, index })))(
  'maps the supported syntax without dropping ranges in corpus $index',
  ({ source }) => {
    const normalized = source.replace(/\r\n?/g, '\n').replace(/\0/g, '\uFFFD')
    const parser = createMarkdownAnalysisParser().use(trackMarkdownSource)
    const tokens = parser.parse(normalized, {})
    const diagnostics: SourceMappingDiagnostic[] = []

    collectSourceNodes(
      normalized,
      tokens,
      markdownLineContexts(normalized, tokens),
      diagnostic => diagnostics.push(diagnostic)
    )
    expect(diagnostics).toEqual([])

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
        'example.dev',
        '**table**'
      ])
    )

    for (const node of nodes) {
      expect(node.from).toBeGreaterThanOrEqual(0)
      expect(node.to).toBeLessThanOrEqual(source.length)
      expect(node.content.from).toBeGreaterThanOrEqual(node.from)
      expect(node.content.to).toBeGreaterThanOrEqual(node.content.from)
      expect(node.content.to).toBeLessThanOrEqual(node.to)

      for (const range of node.syntax) {
        expect(range.from).toBeGreaterThanOrEqual(node.from)
        expect(range.to).toBeGreaterThanOrEqual(range.from)
        expect(range.to).toBeLessThanOrEqual(node.to)
      }
    }
  }
)
