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
 * Nerd Fonts Symbols Only の記号を各ウェイトの Latin サブセットに結合する。
 */
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;700&display=swap'
const NERD_FONTS_BASE_URL =
  'https://raw.githubusercontent.com/ryanoasis/nerd-fonts/v3.4.0/patched-fonts/NerdFontsSymbolsOnly'
const NERD_UNICODE_RANGE = 'U+E000-F8FF, U+F0000-FFFFD'
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

const generateFilename = font => {
  const family = font['font-family'].replace(/[^a-zA-Z0-9_-]/g, '')
  const weight = font['font-weight'].replace(/[^a-zA-Z0-9_-]/g, '')
  const hash = createHash('sha256')
    .update(getUrlFromSrc(font.src))
    .update(GENERATOR_HASH)
    .digest('hex')
    .slice(0, 16)
  return `${family}.${weight}.${hash}.woff2`
}

// Google Fonts の Latin サブセット（または分割されていないフォント）に結合する。
const includesLatin = font => {
  const range = font['unicode-range']
  return (
    !range ||
    range.split(',').some(part => {
      const [start, end = start] = part.trim().slice(2).split('-')
      return (
        parseInt(start.replace(/\?/g, '0'), 16) <= 0x41 &&
        parseInt(end.replace(/\?/g, 'F'), 16) >= 0x41
      )
    })
  )
}

const downloadAndTransform = async (
  fontInfo,
  outputPath,
  nerdFont,
  mergeSymbols
) => {
  const filename = generateFilename(fontInfo)
  const res = await request(getUrlFromSrc(fontInfo.src), 'arraybuffer')
  const readBuffer = Buffer.from(res.data)
  let writeBuffer
  try {
    const font = createFont(readBuffer, { type: 'woff2' })
    if (mergeSymbols) {
      // merge は入力の字形を拡大縮小するため、ウェイトごとに複製する。
      const symbols = createFont(structuredClone(nerdFont.get()))
      const existing = new Set(font.get().glyf.flatMap(g => g.unicode ?? []))
      symbols.get().glyf = symbols.get().glyf.filter(g => {
        g.unicode = (g.unicode ?? []).filter(code => !existing.has(code))
        return g.unicode.length > 0
      })
      font.merge(symbols)
      // merge は輪郭のない字形を省くので、空白の記号も明示的に保持する。
      const scale = font.get().head.unitsPerEm / symbols.get().head.unitsPerEm
      for (const glyph of symbols.get().glyf.filter(g => !g.contours?.length)) {
        glyph.advanceWidth = Math.round(glyph.advanceWidth * scale)
        glyph.leftSideBearing = Math.round((glyph.leftSideBearing ?? 0) * scale)
        font.get().glyf.push(glyph)
      }
      const blankGlyphs = font
        .get()
        .glyf.filter(g => !g.compound && !g.contours?.length)
      // 重複する輪郭点を除去し、WOFF2 エンコーダが拒否する字形を正規化する。
      font.optimize()
      const remaining = new Set(font.get().glyf)
      font.get().glyf.push(...blankGlyphs.filter(g => !remaining.has(g)))
    }
    writeBuffer = Buffer.from(font.write({ type: 'woff2', hinting: false }))
    if (writeBuffer.length === 0) throw new Error('Empty WOFF2 output')
  } catch (error) {
    // 記号の結合に失敗した場合は元フォントで成功扱いにしない。
    if (mergeSymbols) throw error
    writeBuffer = readBuffer
    console.warn(
      `Failed to remove font hinting. Outputted original. ${filename}`
    )
  }
  if (
    writeBuffer.length < 48 ||
    writeBuffer.toString('ascii', 0, 4) !== 'wOF2'
  ) {
    throw new Error(`Invalid WOFF2 output: ${filename}`)
  }
  await fs.writeFile(path.join(outputPath, filename), writeBuffer)
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
      'NerdFonts-LICENSE.txt'
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
  // 範囲が重なるサブセットがあっても、各ウェイト・スタイルにつき一度だけ結合する。
  const symbolFonts = new Set(
    new Map(
      fonts
        .filter(includesLatin)
        .map(font => [
          `${font['font-family']}:${font['font-weight']}:${font['font-style']}`,
          font
        ])
    ).values()
  )
  if (symbolFonts.size === 0) throw new Error('No Latin subset found')
  const nerdResponse = await request(
    `${NERD_FONTS_BASE_URL}/SymbolsNerdFont-Regular.ttf`,
    'arraybuffer'
  )
  const nerdFont = createFont(Buffer.from(nerdResponse.data), {
    type: 'ttf',
    compound2simple: true
  })
  // 通常文字・絵文字との衝突を避け、私用領域の記号のみを取り込む。
  nerdFont.get().glyf = nerdFont.get().glyf.filter(g => {
    g.unicode = (g.unicode ?? []).filter(
      code =>
        (code >= 0xe000 && code <= 0xf8ff) ||
        (code >= 0xf0000 && code <= 0xffffd)
    )
    return g.unicode.length > 0
  })
  await woff2.init()
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  const stagingPath = await fs.mkdtemp(`${outputPath}.tmp-`)
  try {
    const jobs = fonts.map(
      font => () =>
        downloadAndTransform(font, stagingPath, nerdFont, symbolFonts.has(font))
    )
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

    const cssText = fonts
      .map(font =>
        generateFontFace(
          symbolFonts.has(font) && font['unicode-range']
            ? {
                ...font,
                'unicode-range': `${font['unicode-range']}, ${NERD_UNICODE_RANGE}`
              }
            : font,
          generateFilename(font)
        )
      )
      .join('\n')
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
