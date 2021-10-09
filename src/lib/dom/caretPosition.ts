const properties = [
  'position:absolute;',
  'overflow:auto;',
  'word-wrap:break-word;',
  'top:0px;',
  'left:-9999px;'
]

/** カーソルの位置に影響するCSSプロパティ */
const propertyNamesToCopy = [
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'height',
  'letter-spacing',
  'line-height',
  'max-height',
  'min-height',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'border-bottom',
  'border-left',
  'border-right',
  'border-top',
  'text-decoration',
  'text-indent',
  'text-transform',
  'width',
  'word-spacing'
]

const calcMirrorStyle = (textField: HTMLInputElement | HTMLTextAreaElement) => {
  const style = window.getComputedStyle(textField)
  const props = [
    ...properties,
    `white-space:${
      textField.nodeName.toLowerCase() === 'textarea' ? 'pre-wrap' : 'nowrap'
    };`,
    propertyNamesToCopy.map(name => `${name}:${style.getPropertyValue(name)};`)
  ]
  return props.join(' ')
}

/**
 * テキストフィールドとそれを再現したミラー要素を一意に管理するためのマップ
 */
const mirrorMap = new WeakMap<
  HTMLInputElement | HTMLTextAreaElement,
  HTMLDivElement
>()

/**
 * キャレットのテキストフィールドに対する相対位置
 */
type caretPosition = { top: number; left: number }

/**
 * テキストフィールドのキャレット位置を取得する
 * @param markerPosition 再現したいキャレットのインデックス(デフォルト値: テキスト終端)
 */
const getCaretPosition = (
  textField: HTMLInputElement | HTMLTextAreaElement,
  markerPosition: number | null
): caretPosition => {
  let mirror = mirrorMap.get(textField)
  if (mirror && mirror.parentElement === textField.parentElement) {
    mirror.innerHTML = ''
  } else {
    mirror = document.createElement('div')
    mirrorMap.set(textField, mirror)
    mirror.style.cssText = calcMirrorStyle(textField)
  }

  const marker = document.createElement('span')
  marker.style.cssText = 'position: absolute;'
  marker.innerHTML = '&nbsp;'

  let before: Text | undefined
  let after: Text | undefined
  if (markerPosition !== null) {
    const prefix = textField.value.slice(0, markerPosition)
    if (prefix) {
      before = document.createTextNode(prefix)
    }
    const suffix = textField.value.slice(markerPosition)
    if (suffix) {
      after = document.createTextNode(suffix)
    }
  } else {
    const text = textField.value
    if (text) {
      before = document.createTextNode(text)
    }
  }

  if (before) {
    mirror.appendChild(before)
  }

  mirror.appendChild(marker)

  if (after) {
    mirror.appendChild(after)
  }

  if (!mirror.parentElement) {
    if (!textField.parentElement) {
      throw new Error('textField must have a parentElement to mirror')
    }
    textField.parentElement.insertBefore(mirror, textField)
  }

  mirror.scrollTop = textField.scrollTop
  mirror.scrollLeft = textField.scrollLeft

  return {
    top: marker.offsetTop - mirror.scrollTop,
    left: marker.offsetLeft - mirror.scrollLeft
  }
}

export default getCaretPosition
