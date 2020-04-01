'use strict'
const axios = require('axios')
const fs = require('fs')

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
        order: c.order,
        category: c.category,
        category_label: c.category_label,
        emojis: []
      }
    })

    categoryMap['regional'] = {
      order: categories.length + 1,
      category: 'regional',
      category_label: 'Alphabets',
      emojis: []
    }

    const altNameTable = []
    Object.keys(emojis).forEach(key => {
      const e = emojis[key]
      if (e.category === 'modifier') {
        return
      }
      if (e.name.endsWith('skin tone')) {
        return
      }

      const name = e.shortname.replace(/:/g, '')
      categoryMap[e.category].emojis.push({
        name,
        order: e.order,
        code: key
      })
      altNameTable.push({
        code: key,
        name
      })
      e.shortname_alternates.forEach(altName => {
        altNameTable.push({
          altName: altName.replace(/:/g, ''),
          name
        })
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
      result.push(category)
    })

    fs.writeFileSync('./src/assets/unicode_emojis.json', JSON.stringify(result))
    fs.writeFileSync(
      './src/assets/emoji_altname_table.json',
      JSON.stringify(altNameTable)
    )
  })
  .catch(e => {
    console.error(e)
  })
