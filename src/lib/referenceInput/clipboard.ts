import {
  type InputMode,
  type InputPart,
  type Reference,
  isReference,
  partsToDisplayText,
  referenceMatchesMode
} from '../references'

export const REFERENCE_CLIPBOARD_TYPE =
  'application/x-traq-reference-input+json'

export const encodeClipboard = (
  parts: readonly InputPart[],
  mode: InputMode,
  origin: string
) => JSON.stringify({ version: 1, mode, origin, parts })

export const decodeClipboard = (
  value: string,
  mode: InputMode,
  origin: string
): InputPart[] | undefined => {
  try {
    const payload: unknown = JSON.parse(value)

    if (
      !payload ||
      typeof payload !== 'object' ||
      !('version' in payload) ||
      !('mode' in payload) ||
      !('origin' in payload) ||
      !('parts' in payload) ||
      payload.version !== 1 ||
      payload.mode !== mode ||
      payload.origin !== origin ||
      !Array.isArray(payload.parts)
    )
      return

    const parts: InputPart[] = []

    for (const part of payload.parts as unknown[]) {
      if (!part || typeof part !== 'object' || !('type' in part)) return

      if (
        part.type === 'text' &&
        'text' in part &&
        typeof part.text === 'string'
      )
        parts.push({ type: 'text', text: part.text })
      else if (
        part.type === 'reference' &&
        'reference' in part &&
        isReference(part.reference) &&
        referenceMatchesMode(part.reference, mode)
      )
        parts.push({ type: 'reference', reference: part.reference })
      else return
    }

    return parts
  } catch {
    return
  }
}

const ATTRIBUTE = 'data-traq-reference-input'

export const encodeClipboardHtml = (
  parts: readonly InputPart[],
  mode: InputMode,
  origin: string,
  text = partsToDisplayText(parts)
) => {
  const span = document.createElement('span')
  span.setAttribute(ATTRIBUTE, encodeClipboard(parts, mode, origin))
  span.style.whiteSpace = 'pre-wrap'
  span.textContent = text

  return span.outerHTML
}

export const decodeClipboardHtml = (
  html: string,
  mode: InputMode,
  origin: string
) => {
  if (!html.includes(ATTRIBUTE)) return

  const document = new DOMParser().parseFromString(html, 'text/html')

  const payload = document
    .querySelector(`[${ATTRIBUTE}]`)
    ?.getAttribute(ATTRIBUTE)

  return payload ? decodeClipboard(payload, mode, origin) : undefined
}

export const copyMessageParts = async (
  parts: readonly InputPart[],
  plainText = partsToDisplayText(parts)
) => {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob(
            [encodeClipboardHtml(parts, 'message', location.origin, plainText)],
            { type: 'text/html' }
          )
        })
      ])

      return
    } catch {
      /* プレーンテキストの書き込みにしか対応しないブラウザもある。 */
    }
  }

  await navigator.clipboard.writeText(plainText)
}

export const writeClipboardData = (
  data: Pick<DataTransfer, 'setData'>,
  parts: readonly InputPart[],
  mode: InputMode,
  origin: string,
  label?: (reference: Reference) => string
) => {
  const text = partsToDisplayText(parts, label)

  data.setData('text/plain', text)
  data.setData('text/html', encodeClipboardHtml(parts, mode, origin, text))
  data.setData(REFERENCE_CLIPBOARD_TYPE, encodeClipboard(parts, mode, origin))
}

export const readClipboardData = (
  data: Pick<DataTransfer, 'getData'>,
  mode: InputMode,
  origin: string
) =>
  decodeClipboard(data.getData(REFERENCE_CLIPBOARD_TYPE), mode, origin) ??
  decodeClipboardHtml(data.getData('text/html'), mode, origin)
