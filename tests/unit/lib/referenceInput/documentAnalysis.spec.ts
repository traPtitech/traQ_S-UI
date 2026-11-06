import * as markdown from '/@/lib/markdown/analysis'
import {
  analyzeEditorDocument,
  analyzeEditorProbe
} from '/@/lib/referenceInput/documentAnalysis'

import { createInputEditor, installInputEditorFixture } from './fixture'

installInputEditorFixture()

it('shares one analysis per document and keeps completion probes separate', () => {
  const first = createInputEditor('**first**').state.doc
  const second = createInputEditor('**second**').state.doc
  const parse = vi.spyOn(markdown, 'analyzeMarkdownSource')

  try {
    const analysis = analyzeEditorDocument(first)
    analyzeEditorDocument(second)
    const probe = analyzeEditorProbe(first, '**first** :test:')

    expect(analyzeEditorDocument(first)).toBe(analysis)
    expect(analyzeEditorProbe(first, '**first**')).toBe(analysis)
    expect(analyzeEditorProbe(first, '**first** :test:')).toBe(probe)
    expect(parse).toHaveBeenCalledTimes(3)
  } finally {
    parse.mockRestore()
  }
})
