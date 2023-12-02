/* eslint-env node */
/* eslint-disable no-console */
import axios from 'axios'
import postcss from 'postcss'
import { Font, woff2 } from 'fonteditor-core'
import fs from 'fs/promises'
import path from 'path'
import zlib from 'zlib'
import util from 'util'
import esbuild from 'esbuild'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'
import browserslist from 'browserslist'

const brotliCompress = util.promisify(zlib.brotliCompress)

/**
 * このスクリプトは Windows 環境におけるフォントのジャギーを解決するために存在する
 * 行っていることはフォントからフォントヒンティングを取り除くこと
 * @see https://github.com/traPtitech/traQ_S-UI/issues/311
 */

const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;700&display=swap'

const rootPath = './public/fonts'
const rootUrl = '/fonts'

const MAX_REQUESTS_COUNT = 8
const INTERVAL_MS = 30
let PENDING_REQUESTS = 0
axios.default.interceptors.request.use(config => {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
        PENDING_REQUESTS++
        clearInterval(interval)
        resolve(config)
      }
    }, INTERVAL_MS)
  })
})
axios.default.interceptors.response.use(
  response => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.resolve(response)
  },
  error => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.reject(error)
  }
)

const getFontsInfo = async () => {
  const res = await axios.get(FONT_CSS_URL, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4134.0 Safari/537.36'
    }
  })

  const css = postcss.parse(res.data)
  const atRuleNodes = []
  css.walkAtRules('font-face', atRule => {
    atRuleNodes.push(atRule.nodes)
  })
  return atRuleNodes.map(nodes => {
    return Object.fromEntries(nodes.map(({ prop, value }) => [prop, value]))
  })
}

const getUrlFromSrc = src => {
  const m = src.match(/url\((http.+\.woff2)\)/)
  if (!m[1]) throw new Error('Failed to parse src: ', src)
  return m[1]
}

const generateFilename = font => {
  const family = font['font-family'].replace(/[' ]/g, '')
  const weight = font['font-weight'].replace(/[' ]/g, '')

  const fontSrcWithId = getUrlFromSrc(font.src).match(/\/v\d+\/([^/]+)\.woff2/)
  if (!fontSrcWithId) {
    throw new Error(`Unexpected URL: ${getUrlFromSrc(font.src)}`)
  }
  return `${family}.${weight}.${fontSrcWithId[1]}.woff2`
}

const downloadAndtransform = async (url, filename) => {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  const readBuffer = Buffer.from(res.data, 'binary')
  try {
    const font = Font.create(readBuffer, {
      type: 'woff2'
    })
    const writeBuffer = font.write({
      type: 'woff2',
      hinting: false
    })
    await fs.writeFile(path.join(rootPath, filename), writeBuffer)
  } catch (e) {
    await fs.writeFile(path.join(rootPath, filename), readBuffer)
    console.warn(
      `Failed to remove font hinting. Outputted original. ${filename}`
    )
  }
}

const generateFontFace = (font, filename) => {
  const newFont = {
    ...font,
    src: font.src.replace(
      /url\(http.+\.woff2\)/,
      `url('${rootUrl}/${filename}')`
    )
  }
  return `
    @font-face {
      ${Object.entries(newFont)
        .map(([key, val]) => `${key}: ${val};`)
        .join('\n')}
    }
  `
}

;(async () => {
  if (process.env.MAY_SKIP_FONT_GEN) {
    try {
      const files = await fs.readdir(rootPath)
      if (files.some(f => f.endsWith('.woff2'))) {
        console.log('Font cache found. Skipping...')
        return
      }
    } catch {}
  }

  const fonts = await getFontsInfo()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await fs.rm(rootPath, { recursive: true }).catch(() => {})
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await fs.mkdir(rootPath).catch(() => {})

  await woff2.init()

  let cssText = ''
  const promises = []
  for (const font of fonts) {
    const filename = generateFilename(font)
    const fontFaceText = generateFontFace(font, filename)

    promises.push(
      downloadAndtransform(getUrlFromSrc(font.src), filename).catch(() =>
        downloadAndtransform(getUrlFromSrc(font.src), filename)
      )
    )

    cssText += fontFaceText
  }
  const { code: minifiedCssText, warnings } = await esbuild.transform(cssText, {
    loader: 'css',
    minify: true,
    target: resolveToEsbuildTarget(browserslist())
  })
  if (warnings.length > 0) console.warn(warnings)

  promises.push(
    fs.writeFile(path.join(rootPath, './fonts.css'), minifiedCssText, 'utf-8')
  )

  const brotliPromise = (async () => {
    const compressed = await brotliCompress(minifiedCssText, {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
      }
    })
    await fs.writeFile(path.join(rootPath, './fonts.css.br'), compressed)
  })()
  promises.push(brotliPromise)

  const res = await Promise.allSettled(promises)
  res
    .filter(r => r.status === 'rejected')
    .forEach(r => {
      console.error(`Error: ${r.reason}`)
    })

  console.log('Outputted font files')
})()
