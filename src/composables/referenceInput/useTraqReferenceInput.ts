import { embeddingOrigin } from '/@/lib/apis'
import type { ReferenceInputAdapter } from '/@/lib/referenceInput/adapter'
import {
  readClipboardData,
  writeClipboardData
} from '/@/lib/referenceInput/clipboard'
import { pastedChannelLinks } from '/@/lib/referenceInput/pastedChannelLinks'
import { defaultMarkdownServices } from '/@/lib/referenceInput/traqMarkdownServices'
import { traqReferenceCodec } from '/@/lib/referenceInput/traqReferenceCodec'

import useChannelPath from '../useChannelPath'
import useReferenceLabels from './useReferenceLabels'
import useReferenceSuggestions from './useReferenceSuggestions'

/** traQ stores, wire format and candidate providers belong to the host. */
export default function useTraqReferenceInput(): ReferenceInputAdapter {
  const { label } = useReferenceLabels()
  const { channelPathStringToId } = useChannelPath()
  return {
    markdown: defaultMarkdownServices,
    label,
    references: traqReferenceCodec,
    suggestions: useReferenceSuggestions,
    clipboard: {
      read: (data, mode) => readClipboardData(data, mode, location.origin),
      write: (data, parts, mode) =>
        writeClipboardData(data, parts, mode, location.origin, label),
      fromText: (text, before, after) =>
        pastedChannelLinks(text, {
          origins: [location.origin, embeddingOrigin],
          channelPathToId: channelPathStringToId,
          before,
          after
        })
    }
  }
}
