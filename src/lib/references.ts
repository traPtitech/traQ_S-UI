import { embeddingTokens } from './markdown/embeddingTokens'

export type ReferenceType =
  'user' | 'group' | 'channel' | 'search-from' | 'search-to' | 'search-in'

type ReferenceBase = Readonly<{ id: string; raw: string }>

export type SelectedReference = ReferenceBase &
  (
    | { readonly type: 'user' | 'group' | 'channel'; readonly kind?: never }
    | {
        readonly type: 'search-from' | 'search-to'
        readonly kind: 'user' | 'group'
      }
    | { readonly type: 'search-in'; readonly kind: 'channel' | 'dm' }
  )

type LegacySearchReference = ReferenceBase & {
  readonly type: 'search-from' | 'search-to' | 'search-in'
  readonly kind?: undefined
}

export type Reference = SelectedReference | LegacySearchReference

export type InputPart =
  | { type: 'text'; text: string }
  | { type: 'reference'; reference: Reference; originalSource?: string }

export type InputMode = 'message' | 'search'
export type SearchOperator = 'from' | 'to' | 'in'

export const searchReferenceTypes = {
  from: 'search-from',
  to: 'search-to',
  in: 'search-in'
} as const satisfies Record<SearchOperator, ReferenceType>

export const searchOperator = (
  reference: Reference
): SearchOperator | undefined => {
  switch (reference.type) {
    case 'search-from':
      return 'from'
    case 'search-to':
      return 'to'
    case 'search-in':
      return 'in'
    default:
      return undefined
  }
}

const referenceTypes: readonly string[] = [
  'user',
  'group',
  'channel',
  'search-from',
  'search-to',
  'search-in'
]

export const isReference = (value: unknown): value is Reference => {
  if (!value || typeof value !== 'object') return false

  const r = value as Partial<Reference>

  return (
    referenceTypes.includes(r.type ?? '') &&
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    typeof r.raw === 'string' &&
    r.raw.length > 0 &&
    !/[\r\n]/.test(r.raw) &&
    (r.kind === undefined ||
      ((r.type === 'search-from' || r.type === 'search-to') &&
        (r.kind === 'user' || r.kind === 'group')) ||
      (r.type === 'search-in' && (r.kind === 'channel' || r.kind === 'dm')))
  )
}

export const encodeReference = (reference: Reference) =>
  `!${JSON.stringify(reference)}`

export const serializeInput = (parts: readonly InputPart[]) =>
  parts
    .map(p =>
      p.type === 'text'
        ? p.text
        : (p.originalSource ?? encodeReference(p.reference))
    )
    .join('')

export const inputText = (
  parts: readonly InputPart[],
  label: (reference: Reference) => string = reference => reference.raw
) => parts.map(p => (p.type === 'text' ? p.text : label(p.reference))).join('')

export const parseInput = (source: string, mode: InputMode): InputPart[] => {
  const parts: InputPart[] = []
  let start = 0

  for (const token of embeddingTokens(source)) {
    const reference = token.value

    if (!isReference(reference) || !referenceMatchesMode(reference, mode))
      continue

    if (start < token.start)
      parts.push({ type: 'text', text: source.slice(start, token.start) })

    parts.push({ type: 'reference', reference, originalSource: token.source })
    start = token.start + token.length
  }

  if (start < source.length)
    parts.push({ type: 'text', text: source.slice(start) })

  return parts
}

export const referenceMatchesMode = (reference: Reference, mode: InputMode) =>
  (searchOperator(reference) !== undefined) === (mode === 'search')
