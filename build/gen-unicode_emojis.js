import axios from 'axios'
import fs from 'fs/promises'

const ZWJ = String.fromCodePoint(0x200d)

// https://github.com/traPtitech/traQ/blob/31859a583f500463913031d924b1244f28e36a68/utils/twemoji/installer.go#L43-L49
const replaceNameMap = {
  // 英数字以外の文字が含まれているので置き換え
  'pi\u00f1ata': 'pinata',
  // 長すぎるので置き換え
  face_with_open_eyes_and_hand_over_mouth: 'face_with_open_eyes_hand',
  hand_with_index_finger_and_thumb_crossed: 'hand_index_finger_thumb_crossed'
}

const [{ data: emojis }, { data: categories }] = await Promise.all([
  axios.get(
    'https://raw.githubusercontent.com/joypixels/emoji-assets/v7.0.0/emoji.json'
  ),
  // バージョンが異なるが、カテゴリが増えていなければ問題ない
  axios.get(
    'https://raw.githubusercontent.com/joypixels/emoji-toolkit/6.6.0/categories.json'
  )
])

const categoryMap = Object.fromEntries(
  categories.map(c => [
    c.category,
    {
      order: c.order,
      category: c.category,
      category_label: c.category_label,
      emojis: []
    }
  ])
)

categoryMap['regional'] = {
  order: categories.length + 1,
  category: 'regional',
  category_label: 'Alphabets',
  emojis: []
}

const unicodeTable = {}
const altNameTable = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine'
}
Object.entries(emojis).forEach(([key, e]) => {
  if (e.category === 'modifier') return
  if (e.name.endsWith('skin tone')) return

  let name = e.shortname.replaceAll(':', '')
  const replacedName = replaceNameMap[name]
  if (replacedName !== undefined) {
    name = replacedName
  }

  categoryMap[e.category].emojis.push({ name, order: e.order })

  const unicodeString = key
    .split('-')
    .map(codePoint => String.fromCodePoint(parseInt(codePoint, 16)))
    .join(ZWJ)
  unicodeTable[unicodeString] = name

  e.shortname_alternates.forEach(altName => {
    altNameTable[altName.replaceAll(':', '')] = name
  })
})

const result = Object.entries(categoryMap).map(([key, category]) => {
  if (key === 'regional') {
    category.emojis.sort((a, b) => (a.order > b.order ? -1 : 1))
  } else {
    category.emojis.sort((a, b) => (a.order < b.order ? -1 : 1))
  }

  return {
    category: category.category,
    emojis: category.emojis.map(({ name }) => name)
  }
})

const sortedAltNameTable = Object.fromEntries(
  Object.entries(altNameTable).sort((a, b) => (a[0] > b[0] ? 1 : -1))
)
const sortedUnicodeTable = Object.fromEntries(
  Object.entries(unicodeTable).sort((a, b) => (a[0] > b[0] ? 1 : -1))
)

await Promise.all([
  fs.writeFile('./src/assets/unicode_emojis.json', JSON.stringify(result)),
  fs.writeFile(
    './src/assets/emoji_altname_table.json',
    JSON.stringify({
      altNameTable: sortedAltNameTable,
      unicodeTable: sortedUnicodeTable
    })
  )
])
