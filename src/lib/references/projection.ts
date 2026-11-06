import {
  type MarkdownSourceAnalysis,
  analyzeMarkdownSource
} from '../markdown/analysis'
import type { InputPart } from '../references'

export const referencePlaceholder = '\uFFFC'

declare const projectedInputAnalysis: unique symbol
export type ProjectedInputAnalysis = MarkdownSourceAnalysis & {
  readonly [projectedInputAnalysis]: true
}

export const analyzeProjectedInput = (text: string): ProjectedInputAnalysis =>
  analyzeMarkdownSource(text) as ProjectedInputAnalysis

export const partsToProjectedText = (parts: readonly InputPart[]) =>
  parts
    .map(part => (part.type === 'text' ? part.text : referencePlaceholder))
    .join('')
