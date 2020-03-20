import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import MarkdownItMark from 'markdown-it-mark'
import mila from 'markdown-it-link-attributes'
import spoiler from 'markdown-it-spoiler'
import filter from 'markdown-it-image-filter'
import katexE from 'katex'
import katex from '@traptitech/markdown-it-katex'
import whitelist from './domain_whitelist.json'

function highlight(code: string, lang: string) {
  const [langName, langCaption] = lang.split(':')
  const citeTag = langCaption ? `<cite>${langCaption}</cite>` : ''
  const noHighlightRe = /^(no-?highlight|plain|text)$/i
  if (hljs.getLanguage(langName)) {
    const result = hljs.highlight(langName, code)
    return `<pre class="traq-code traq-lang">${citeTag}<code class="lang-${result.language}">${result.value}</code></pre>`
  } else if (noHighlightRe.test(langName)) {
    return `<pre class="traq-code traq-lang">${citeTag}<code>${md.utils.escapeHtml(
      code
    )}</code></pre>`
  } else {
    const result = hljs.highlightAuto(code)
    return `<pre class="traq-code traq-lang">${citeTag}<code class="lang-${result.language}">${result.value}</code></pre>`
  }
}

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  highlight
})

md.use(MarkdownItMark)
md.use(spoiler, true)
// md.use(json)
// md.use(stamp)
md.use(katex, {
  katex: katexE,
  output: 'html',
  maxSize: 100,
  blockClass: 'is-scroll'
})
md.use(mila, {
  attrs: {
    target: '_blank',
    rel: 'nofollow noopener noreferrer'
  }
})
md.use(filter(whitelist, { httpsOnly: true }))

export const render = (text: string) => {
  return md.render(text, {})
}
