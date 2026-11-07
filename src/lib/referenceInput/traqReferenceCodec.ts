import { normalizeMessageParts } from '../message/content'
import { parseInput, serializeInput } from '../references'
import type { ReferenceCodec } from './adapter'

export const traqReferenceCodec: ReferenceCodec = {
  parse: (source, mode) => {
    const parts = parseInput(source, mode)
    return mode === 'message' ? normalizeMessageParts(parts) : parts
  },
  serialize: serializeInput,
  normalize: normalizeMessageParts
}
