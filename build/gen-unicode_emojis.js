/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'
const axios = require('axios')
const fs = require('fs')

const ZWJ = String.fromCodePoint(0x200d)

Promise.all([
  axios.get(
    'https://raw.githubusercontent.com/emojione/emojione/master/emoji.json'
  ),
  axios.get(
    'https://raw.githubusercontent.com/emojione/emojione/master/categories.json'
  )
])
  .then(results => {
    const emojis = results[0].data
    const categories = results[1].data

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
    Object.keys(emojis).forEach(key => {
      const e = emojis[key]
      if (e.category === 'modifier') {
        return
      }
      if (e.name.endsWith('skin tone')) {
        return
      }

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
    Object.keys(categoryMap).forEach(key => {
      const category = categoryMap[key]
      if (key === 'regional') {
        category.emojis.sort((a, b) => (a.order > b.order ? -1 : 1))
      } else {
        category.emojis.sort((a, b) => (a.order < b.order ? -1 : 1))
      }
      category.emojis = category.emojis.map(({ name }) => name)
      result.push(category)
    })

    fs.writeFileSync('./src/assets/unicode_emojis.json', JSON.stringify(result))
    fs.writeFileSync(
      './src/assets/emoji_altname_table.json',
      JSON.stringify({ altNameTable, unicodeTable })
    )
  })
  .catch(e => {
    // eslint-disable-next-line no-console
    console.error(e)
  })
