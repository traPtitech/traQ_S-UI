import type { Store } from '@traptitech/traq-markdown-it'
import { traQMarkdownIt } from '@traptitech/traq-markdown-it'

import type { KatexOptions } from 'katex'

const store: Store = {
  getChannel: id => ({ id }),
  getMe: () => ({ id: '' }),
  getStampByName: name => ({ name, fileId: '' }),
  getUser: id => ({ id }),
  getUserByName: _name => ({ iconFileId: '' }),
  getUserGroup: _id => ({ members: [] }),
  generateChannelHref: () => '',
  generateUserHref: () => '',
  generateUserGroupHref: () => ''
}

const md = new traQMarkdownIt(store, [], 'https://example.com')

describe('Markdown math', () => {
  it.each([
    String.raw`$\frac{a}{b}$`,
    String.raw`$$
\frac{a}{b}
$$`
  ])('renders %s with the KaTeX stylesheet classes', text => {
    const container = document.createElement('div')
    container.innerHTML = md.render(text).renderedText

    expect(container.querySelector('.katex .katex-base .mfrac')).not.toBeNull()
    expect(container.querySelector('.katex-error')).toBeNull()
  })

  it('does not enable trusted rendering through inherited options', () => {
    const options = Object.create({ trust: true }) as KatexOptions
    const container = document.createElement('div')
    container.innerHTML = md.katexOptions.katex.renderToString(
      String.raw`\href{https://example.com}{link}`,
      options
    )

    expect(container.querySelector('a')).toBeNull()
  })
})
