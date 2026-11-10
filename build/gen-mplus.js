/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import zlib from 'node:zlib'

import * as lightningcss from 'lightningcss'
import axios from 'axios'
import browserslist from 'browserslist'
import { createFont, woff2 } from 'fonteditor-core'
import postcss from 'postcss'

const brotliCompress = promisify(zlib.brotliCompress)

/**
 * M PLUS 1p のヒンティングを除去して Windows でのジャギーを防ぐ。
 * @see https://github.com/traPtitech/traQ_S-UI/issues/311
 * Nerd Fonts Symbols Only（Mono 版）の記号を私用領域に限定した別 face として配信する。
 * コードブロック用に Monaspace Neon を配信する。
 */
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;700&display=swap'
const NERD_FONTS_BASE_URL =
  'https://raw.githubusercontent.com/ryanoasis/nerd-fonts/v3.4.0/patched-fonts/NerdFontsSymbolsOnly'
const NERD_UNICODE_RANGE = 'U+E000-F8FF, U+F0000-FFFFD'
// コードブロック用の記号 family（src/styles/_markdown.scss で参照）。
const SYMBOL_CODE_FAMILY = 'traQ Symbols Mono'
// Mono 版の字形幅は 1em なので、Monaspace の 1 文字幅（0.62em）に縮める。
const SYMBOL_CODE_SIZE_ADJUST = '62%'
// コードブロック用の等幅フォント（src/styles/_markdown.scss で参照）。
const MONASPACE_BASE_URL =
  'https://raw.githubusercontent.com/githubnext/monaspace/v1.400'
const MONASPACE_FAMILY = 'Monaspace Neon'
const MONASPACE_FACES = [
  { weight: '400', file: 'MonaspaceNeon-Regular.woff2' },
  { weight: '700', file: 'MonaspaceNeon-Bold.woff2' }
]
const outputPath = './public/fonts'
const rootUrl = '/fonts'
const MAX_REQUESTS_COUNT = 8
const GENERATOR_HASH = createHash('sha256')
  .update(await fs.readFile(fileURLToPath(import.meta.url)))
  .update(await fs.readFile(new URL('../package-lock.json', import.meta.url)))
  .digest('hex')

const request = async (url, responseType = 'text') => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await axios.get(url, {
        responseType,
        timeout: 30000,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4134.0 Safari/537.36'
        }
      })
    } catch (error) {
      if (attempt >= 1) throw error
    }
  }
}

const getFontsInfo = async () => {
  const res = await request(FONT_CSS_URL)
  const fonts = []
  postcss.parse(res.data).walkAtRules('font-face', atRule => {
    fonts.push(
      Object.fromEntries(
        atRule.nodes
          .filter(node => node.type === 'decl')
          .map(({ prop, value }) => [prop, value])
      )
    )
  })
  if (fonts.length === 0)
    throw new Error('No font faces found in Google Fonts CSS')
  return fonts
}

const getUrlFromSrc = src => {
  const match = src.match(/url\(\s*(['"]?)(https?:\/\/[^\s'"()]+)\1\s*\)/)
  if (!match) throw new Error(`Failed to parse src: ${src}`)
  return match[2]
}

// 内容から名前を決め、中身が変わらない限り URL を変えない（SW の再取得を防ぐ）。
const generateFilename = (name, buffer) => {
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16)
  return `${name.replace(/[^a-zA-Z0-9_.-]/g, '')}.${hash}.woff2`
}

const assertWoff2 = (buffer, label) => {
  if (buffer.length < 48 || buffer.toString('ascii', 0, 4) !== 'wOF2') {
    throw new Error(`Invalid WOFF2 output: ${label}`)
  }
}

const downloadAndTransform = async (fontInfo, outputPath) => {
  const url = getUrlFromSrc(fontInfo.src)
  const res = await request(url, 'arraybuffer')
  const readBuffer = Buffer.from(res.data)
  let writeBuffer
  try {
    const font = createFont(readBuffer, { type: 'woff2' })
    writeBuffer = Buffer.from(font.write({ type: 'woff2', hinting: false }))
    assertWoff2(writeBuffer, url)
  } catch {
    writeBuffer = readBuffer
    console.warn(`Failed to remove font hinting. Outputted original. ${url}`)
  }
  assertWoff2(writeBuffer, url)
  const filename = generateFilename(
    `${fontInfo['font-family']}.${fontInfo['font-weight']}`,
    writeBuffer
  )
  await fs.writeFile(path.join(outputPath, filename), writeBuffer)
  return filename
}

// Nerd Fonts の記号を独立したフォントとして出力する。
// 全字形の幅が揃った Mono 版を使い、本文とコードブロックで同じファイルを共有する。
// unicode-range で私用領域に限定するため、記号を表示したときだけ読み込まれる。
const generateSymbolFont = async outputPath => {
  const res = await request(
    `${NERD_FONTS_BASE_URL}/SymbolsNerdFontMono-Regular.ttf`,
    'arraybuffer'
  )
  const font = createFont(Buffer.from(res.data), {
    type: 'ttf',
    compound2simple: true
  })
  // 通常文字・絵文字との衝突を避け、私用領域の記号のみを残す（.notdef は保持）。
  font.get().glyf = font.get().glyf.filter((g, i) => {
    if (i === 0) return true
    g.unicode = (g.unicode ?? []).filter(
      code =>
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd)
    )
    return g.unicode.length > 0
  })
  const blankGlyphs = font
    .get()
    .glyf.filter(g => !g.compound && !g.contours?.length)
  // 重複する輪郭点を除去し、WOFF2 エンコーダが拒否する字形を正規化する。
  // optimize は輪郭のない字形を省くので、空白の記号は戻す。
  font.optimize()
  const remaining = new Set(font.get().glyf)
  font.get().glyf.push(...blankGlyphs.filter(g => !remaining.has(g)))
  const buffer = Buffer.from(font.write({ type: 'woff2', hinting: false }))
  assertWoff2(buffer, 'SymbolsNerdFontMono')
  const filename = generateFilename('SymbolsNerdFontMono', buffer)
  await fs.writeFile(path.join(outputPath, filename), buffer)
  return filename
}

// Monaspace は OFL の予約フォント名を持ち、改変版はその名前を使えないため、
// 配布されている WOFF2 をそのまま配信する（texture healing 用の GSUB も保たれる）。
const downloadMonaspace = async (face, outputPath) => {
  const url = `${MONASPACE_BASE_URL}/fonts/Web%20Fonts/Static%20Web%20Fonts/Monaspace%20Neon/${face.file}`
  const res = await request(url, 'arraybuffer')
  const buffer = Buffer.from(res.data)
  assertWoff2(buffer, url)
  const filename = generateFilename(
    `${MONASPACE_FAMILY}.${face.weight}`,
    buffer
  )
  await fs.writeFile(path.join(outputPath, filename), buffer)
  return filename
}

const generateFontFace = (font, filename) => {
  const newFont = {
    ...font,
    src: `url('${rootUrl}/${filename}') format('woff2')`
  }
  return `@font-face {${Object.entries(newFont)
    .map(([key, val]) => `${key}: ${val};`)
    .join('\n')}}`
}

// 旧版・失敗途中・ファイル欠損のキャッシュは再生成する。
const hasFontCache = async (outputPath, version) => {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(outputPath, 'manifest.json'), 'utf8')
    )
    if (manifest.version !== version) return false
    for (const filename of [
      'fonts.css',
      'fonts.css.br',
      'NerdFonts-LICENSE.txt',
      'Monaspace-LICENSE.txt'
    ]) {
      if (!manifest.files[filename]) return false
    }
    const files = Object.entries(manifest.files)
    const valid = await Promise.all(
      files.map(async ([filename, size]) => {
        const stat = await fs.stat(path.join(outputPath, filename))
        return stat.isFile() && size > 0 && stat.size === size
      })
    )
    return valid.every(Boolean)
  } catch {
    return false
  }
}

const main = async () => {
  if (
    process.env.MAY_SKIP_FONT_GEN &&
    (await hasFontCache(outputPath, GENERATOR_HASH))
  ) {
    console.log('Font cache found. Skipping...')
    return
  }

  const fonts = await getFontsInfo()
  await woff2.init()
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  const stagingPath = await fs.mkdtemp(`${outputPath}.tmp-`)
  try {
    const filenames = new Map()
    let symbolFilename
    const jobs = fonts.map(font => async () => {
      filenames.set(font, await downloadAndTransform(font, stagingPath))
    })
    for (const face of MONASPACE_FACES) {
      jobs.push(async () => {
        filenames.set(face, await downloadMonaspace(face, stagingPath))
      })
    }
    jobs.push(async () => {
      const res = await request(`${MONASPACE_BASE_URL}/LICENSE`)
      await fs.writeFile(
        path.join(stagingPath, 'Monaspace-LICENSE.txt'),
        res.data
      )
    })
    jobs.push(async () => {
      symbolFilename = await generateSymbolFont(stagingPath)
    })
    jobs.push(async () => {
      const res = await request(`${NERD_FONTS_BASE_URL}/LICENSE`)
      await fs.writeFile(
        path.join(stagingPath, 'NerdFonts-LICENSE.txt'),
        res.data
      )
    })
    const results = await Promise.allSettled(
      Array.from({ length: MAX_REQUESTS_COUNT }, async () => {
        while (jobs.length) await jobs.shift()()
      })
    )
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length) {
      throw new AggregateError(
        failures.map(result => result.reason),
        'Failed to generate fonts'
      )
    }

    // 記号 face も既存の各 weight/style と同じ記述子で定義する。
    // unicode-range が重なる場合は後に定義した face が優先されるため最後に置く。
    const symbolFontFaces = new Map(
      fonts.map(font => [
        `${font['font-family']}:${font['font-style']}:${font['font-weight']}`,
        {
          'font-family': font['font-family'],
          'font-style': font['font-style'],
          'font-weight': font['font-weight'],
          'font-display': font['font-display'] ?? 'swap',
          'unicode-range': NERD_UNICODE_RANGE
        }
      ])
    ).values()
    // コードブロック用。family 内の face が 1 つなので weight は範囲指定でよい。
    // URL は本文用と共通なので、ダウンロードは 1 回で済む。
    const symbolCodeFontFace = {
      'font-family': `'${SYMBOL_CODE_FAMILY}'`,
      'font-style': 'normal',
      'font-weight': '100 900',
      'font-display': 'swap',
      'size-adjust': SYMBOL_CODE_SIZE_ADJUST,
      'unicode-range': NERD_UNICODE_RANGE
    }
    const monaspaceFontFaces = MONASPACE_FACES.map(face =>
      generateFontFace(
        {
          'font-family': `'${MONASPACE_FAMILY}'`,
          'font-style': 'normal',
          'font-weight': face.weight,
          'font-display': 'swap'
        },
        filenames.get(face)
      )
    )
    const cssText = [
      ...fonts.map(font => generateFontFace(font, filenames.get(font))),
      ...monaspaceFontFaces,
      ...[...symbolFontFaces, symbolCodeFontFace].map(face =>
        generateFontFace(face, symbolFilename)
      )
    ].join('\n')
    const { code: minifiedCss } = lightningcss.transform({
      filename: 'fonts.css',
      code: Buffer.from(cssText),
      minify: true,
      targets: lightningcss.browserslistToTargets(
        browserslist('baseline widely available')
      )
    })
    await fs.writeFile(path.join(stagingPath, 'fonts.css'), minifiedCss)
    await fs.writeFile(
      path.join(stagingPath, 'fonts.css.br'),
      await brotliCompress(minifiedCss, {
        params: {
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
          [zlib.constants.BROTLI_PARAM_QUALITY]:
            zlib.constants.BROTLI_MAX_QUALITY
        }
      })
    )
    const files = {}
    for (const filename of await fs.readdir(stagingPath)) {
      files[filename] = (await fs.stat(path.join(stagingPath, filename))).size
    }
    await fs.writeFile(
      path.join(stagingPath, 'manifest.json'),
      JSON.stringify({ version: GENERATOR_HASH, files })
    )
    // 全ファイルの生成成功後に公開ディレクトリを置き換える。
    await fs.rm(outputPath, { recursive: true, force: true })
    await fs.rename(stagingPath, outputPath)
    console.log('Outputted font files')
  } finally {
    await fs.rm(stagingPath, { recursive: true, force: true })
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
