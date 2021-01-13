const properties = [
  'position:absolute;',
  'overflow:auto;',
  'word-wrap:break-word;',
  'top:-200px;',
  'left:30px;'
]

// カーソルの位置に影響するCSSプロパティをテキストフィールドからdiv要素にコピーする
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

// { テキストフィールド: ミラー }
const mirrorMap = new WeakMap()

// テキストフィールドを模したdiv要素を画面外に準備する
//
// textField: HTMLInputElement or HTMLTextAreaElement element
// markerPosition: 再現したいカーソルのインデックス(デフォルト値: テキスト終端)
//
// mirror: DOMに紐付いたエレメントを返す. caret位置取得後のエレメント削除は呼び出し元の責任
// marker: カーソルと同じ位置に存在するspanエレメント
const textFieldMirror = (
  textField: HTMLInputElement | HTMLTextAreaElement,
  markerPosition: number | null
): { mirror: HTMLElement; marker: HTMLSpanElement } => {
  const nodeName = textField.nodeName.toLowerCase()
  if (nodeName !== 'textarea' && nodeName !== 'input') {
    throw new Error('expected textField to a textarea or input')
  }

  let mirror = mirrorMap.get(textField)
  if (mirror && mirror.parentElement === textField.parentElement) {
    mirror.innerHTML = ''
  } else {
    mirror = document.createElement('div')
    mirrorMap.set(textField, mirror)
    const style = window.getComputedStyle(textField)
    const props = properties.slice(0)
    if (nodeName === 'textarea') {
      props.push('white-space:pre-wrap;')
    } else {
      props.push('white-space:nowrap;')
    }
    propertyNamesToCopy.forEach(name =>
      props.push(`${name}:${style.getPropertyValue(name)};`)
    )
    mirror.style.cssText = props.join(' ')
  }

  const marker = document.createElement('span')
  marker.style.cssText = 'position: absolute;'
  marker.innerHTML = '&nbsp;'

  let before
  let after
  if (typeof markerPosition === 'number') {
    let text = textField.value.substring(0, markerPosition)
    if (text) {
      before = document.createTextNode(text)
    }
    text = textField.value.substring(markerPosition)
    if (text) {
      after = document.createTextNode(text)
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

  return { mirror, marker }
}

export default textFieldMirror
