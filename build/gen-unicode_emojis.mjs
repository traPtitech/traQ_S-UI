import axios from 'axios'
import fs from 'fs/promises'

const ZWJ = String.fromCodePoint(0x200d)

const [{ data: emojis }, { data: categories }] = await Promise.all([
  axios.get(
    'https://raw.githubusercontent.com/emojione/emojione/master/emoji.json'
  ),
  axios.get(
    'https://raw.githubusercontent.com/emojione/emojione/master/categories.json'
  )
])

const categoryMap = {}

categories.forEach(c => {
  categoryMap[c.category] = {
    category: c.category,
    emojis: []
  }
})

categoryMap['regional'] = {
  order: categories.length + 1,
  category: 'regional',
  category_label: 'Alphabets',
  emojis: []
}

const unicodeTable = {}
const altNameTable = {}
Object.entries(emojis).forEach(([key, e]) => {
  if (e.category === 'modifier') return
  if (e.name.endsWith('skin tone')) return

  const name = e.shortname.replace(/:/g, '')
  categoryMap[e.category].emojis.push({ name, order: e.order })

  const unicodeString = key
    .split('-')
    .map(codePoint => String.fromCodePoint(parseInt(codePoint, 16)))
    .join(ZWJ)
  unicodeTable[unicodeString] = name

  e.shortname_alternates.forEach(altName => {
    altNameTable[altName.replace(/:/g, '')] = name
  })
})

const result = []
Object.entries(categoryMap).forEach(([key, category]) => {
  if (key === 'regional') {
    category.emojis.sort((a, b) => (a.order > b.order ? -1 : 1))
  } else {
    category.emojis.sort((a, b) => (a.order < b.order ? -1 : 1))
  }
  category.emojis = category.emojis.map(({ name }) => name)
  result.push(category)
})

await Promise.all([
  fs.writeFile('./src/assets/unicode_emojis.json', JSON.stringify(result)),
  fs.writeFile(
    './src/assets/emoji_altname_table.json',
    JSON.stringify({ altNameTable, unicodeTable })
  )
])
