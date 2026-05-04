import fs from 'fs/promises'
import { styleText } from 'util'

import axios from 'axios'

// 開発環境で実行するスクリプトのため, console の使用は問題ない.
/* eslint no-console: 0 */

const OUTPUT_EMOJIS_FILE = './src/assets/unicode_emojis.json'
const OUTPUT_ALT_NAMES_FILE = './src/assets/emoji_altname_table.json'

// https://github.com/traPtitech/traQ/blob/d6d3981a412e5b259c04bcfcef6b87c58b3c7267/utils/twemoji/installer.go#L30
const UNICODE_EMOJIS_META_URL =
  'https://raw.githubusercontent.com/joypixels/emoji-assets/v9.0.0/emoji.json'
const UNICODE_EMOJIS_CATEGORIES_URL =
  'https://raw.githubusercontent.com/joypixels/emoji-toolkit/9.0.0/categories.json'

// https://github.com/traPtitech/traQ/blob/1ebbfabc64891ea6181ad4b3f417702dd5cad5ca/utils/validator/rules.go#L75-L79
const TRAQ_STAMP_NAME_RULE = /^[a-zA-Z0-9_-]{1,32}$/

// ZWJ (Zero Width Joiner): 複数の Unicode 文字を結合して1つの絵文字として表示するために使用される特殊な文字.
const ZWJ = String.fromCodePoint(0x200d)

// https://github.com/traPtitech/traQ/blob/d6d3981a412e5b259c04bcfcef6b87c58b3c7267/utils/twemoji/installer.go#L44-L58
const replaceNameMap: Record<string, string> = {
  // 英数字以外の文字が含まれているので置き換え
  'pi\u00f1ata': 'pinata',
  // 長すぎるので置き換え
  face_with_open_eyes_and_hand_over_mouth: 'face_with_open_eyes_hand',
  hand_with_index_finger_and_thumb_crossed: 'hand_index_finger_thumb_crossed',
  man_in_motorized_wheelchair_facing_right: 'man_powered_wheelchair_right',
  man_in_manual_wheelchair_facing_right: 'man_manual_wheelchair_right',
  woman_in_manual_wheelchair_facing_right: 'woman_manual_wheelchair_right',
  woman_in_motorized_wheelchair_facing_right: 'woman_powered_wheelchair_right',
  person_in_motorized_wheelchair_facing_right:
    'person_powered_wheelchair_right',
  person_in_manual_wheelchair_facing_right: 'person_manual_wheelchair_right',
  woman_with_white_cane_facing_right: 'woman_white_cane_facing_right',
  person_with_white_cane_facing_right: 'person_white_cane_facing_right'
}

/**
 *  スタンプ名重複の検査
 */
function checkDuplicateStampNames(emojis: { [unicodeString: string]: string }) {
  const nameToUnicodeStringsMap = Object.entries(emojis).reduce(
    (grouped, [unicodeString, name]) => {
      if (!grouped[name]) {
        grouped[name] = []
      }
      grouped[name].push(unicodeString)
      return grouped
    },
    {} as Record<string, string[]>
  )
  const duplicateNames = Object.entries(nameToUnicodeStringsMap).filter(
    ([, unicodeStrings]) => unicodeStrings.length > 1
  )
  if (duplicateNames.length > 0) {
    console.error(
      styleText('bgRed', 'ERROR'),
      'Duplicate stamp names found. Please fix `replaceNameMap` for these emojis:',
      Object.fromEntries(duplicateNames),
      '\n'
    )
    throw new Error('Duplicate stamp names found')
  }
}

/**
 * traQ 上の制約に合わないスタンプ名の検査
 */
function checkInvalidStampNames(emojis: { [unicodeString: string]: string }) {
  const invalidEmojiNames = Object.values(emojis).filter(
    name => !TRAQ_STAMP_NAME_RULE.test(name)
  )
  if (invalidEmojiNames.length > 0) {
    console.error(
      styleText('bgRed', 'ERROR'),
      'Invalid emoji names found. Please fix `replaceNameMap` for these names:',
      invalidEmojiNames,
      '\n'
    )
    throw new Error('Invalid stamp names found')
  }
}

/**
 *  データ取得
 */
async function fetchData() {
  const [{ data: emojis }, { data: categories }] = await Promise.all([
    axios.get(UNICODE_EMOJIS_META_URL) as Promise<{
      data: Record<
        string,
        {
          name: string
          category: string
          order: number
          shortname: string
          shortname_alternates: string[]
        }
      >
    }>,
    axios.get(UNICODE_EMOJIS_CATEGORIES_URL) as Promise<{
      data: { order: number; category: string; category_label: string }[]
    }>
  ])
  return { emojis, categories }
}

async function main() {
  const { emojis, categories } = await fetchData()

  const categoryMap = Object.fromEntries(
    categories.map(c => [
      c.category,
      {
        order: c.order,
        category: c.category,
        category_label: c.category_label,
        emojis: [] as { name: string; order: number }[]
      }
    ])
  )
  categoryMap['regional'] = {
    order: categories.length + 1,
    category: 'regional',
    category_label: 'Alphabets',
    emojis: []
  }

  const unicodeTable: Record<string, string> = {}
  const altNameTable: Record<string, string> = {
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

    let name = e.shortname.replaceAll(/^:|:$/g, '')
    const replacedName = replaceNameMap[name]
    if (replacedName !== undefined) {
      name = replacedName
    }

    const category = categoryMap[e.category]
    if (!category) {
      console.error(
        styleText('bgRed', 'ERROR'),
        `Category not found for emoji:`,
        e,
        '\n'
      )
      throw new Error(`Category "${e.category}" not found`)
    }
    category.emojis.push({ name, order: e.order })

    const unicodeString = key
      .split('-')
      .map(codePoint => String.fromCodePoint(parseInt(codePoint, 16)))
      .join(ZWJ)
    unicodeTable[unicodeString] = name

    e.shortname_alternates.forEach(altName => {
      altNameTable[altName.replaceAll(/^:|:$/g, '')] = name
    })
  })

  checkDuplicateStampNames(unicodeTable)
  checkInvalidStampNames(unicodeTable)

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
    fs.writeFile(OUTPUT_EMOJIS_FILE, JSON.stringify(result)),
    fs.writeFile(
      OUTPUT_ALT_NAMES_FILE,
      JSON.stringify({
        altNameTable: sortedAltNameTable,
        unicodeTable: sortedUnicodeTable
      })
    )
  ])
  console.log(styleText('bgCyan', 'INFO'), 'Generated:', [
    OUTPUT_EMOJIS_FILE,
    OUTPUT_ALT_NAMES_FILE
  ])
}

await main().catch(e => {
  console.error(e)
  process.exit(1)
})
