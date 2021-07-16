/* eslint-disable no-console */
import axios from 'axios'
import postcss from 'postcss'
import { Font, woff2 } from 'fonteditor-core'
import fs from 'fs/promises'
import path from 'path'

const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;700&display=swap'

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
  const i = getUrlFromSrc(font.src).match(/\/v\d+\/(.+)\.woff/)
  return `${font['font-family'].replace(/[' ]/g, '')}.${
    i && i[1] ? i[1] : ''
  }.woff2`
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
    await fs.writeFile(path.join('./public/fonts', filename), writeBuffer)
  } catch (e) {
    await fs.writeFile(path.join('./public/fonts', filename), readBuffer)
    console.warn(
      `Failed to remove font hinting. Outputted original. ${filename}`
    )
  }
}

const generateFontFace = (font, filename) => {
  const newFont = {
    ...font,
    src: font.src.replace(/url\(http.+\.woff2\)/, `url('/fonts/${filename}')`)
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
      const files = await fs.readdir('./public/fonts')
      if (files.some(f => f.endsWith('.woff2'))) {
        console.log('Font cache found. Skipping...')
        return
      }
    } catch {}
  }

  const fonts = await getFontsInfo()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await fs.rmdir('./public/fonts', { recursive: true }).catch(() => {})
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await fs.mkdir('./public/fonts').catch(() => {})

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

  promises.push(fs.writeFile('./public/fonts/fonts.css', cssText, 'utf-8'))

  const res = await Promise.allSettled(promises)
  res
    .filter(r => r.status === 'rejected')
    .forEach(r => {
      console.error(`Error: ${r.reason}`)
    })

  console.log('Outputted font files')
})()
