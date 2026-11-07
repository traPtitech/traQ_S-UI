import { pastedChannelLinks } from '/@/lib/referenceInput/pastedChannelLinks'

const origin = 'https://traq.example'
const link = `[#team/Client](${origin}/channels/team/Client)`

const reference = {
  type: 'reference',
  reference: { type: 'channel', id: 'client-id', raw: '#team/Client' }
}

const parse = (text: string, before = '', after = '') =>
  pastedChannelLinks(text, {
    origins: [origin, 'https://preview.example'],

    channelPathToId: path => {
      if (path === 'team/Client') return 'client-id'
      throw new Error('Unknown channel')
    },

    before,
    after
  })

describe('pasted channel links', () => {
  it('converts copied Markdown into a channel reference', () => {
    expect(parse(link)).toEqual([reference])
  })

  it('retains surrounding text and converts multiple links in source order', () => {
    expect(parse(`😀 **${link}**\n${link} end`)).toEqual([
      { type: 'text', text: '😀 **' },
      reference,
      { type: 'text', text: '**\n' },
      reference,
      { type: 'text', text: ' end' }
    ])
  })

  it.each(['> ', '- ', '> - '])(
    'supports links inside %j containers',
    prefix => {
      expect(parse(prefix + link)).toEqual([
        { type: 'text', text: prefix },
        reference
      ])
    }
  )

  it('converts links from the frontend origin as well as the canonical origin', () => {
    expect(parse(link.replace(origin, 'https://preview.example'))).toEqual([
      reference
    ])
  })

  it.each([
    `[#team/Client](https://other.example/channels/team/Client)`,
    `[#team/Client](${origin}/channels/other)`,
    `[#other](${origin}/channels/team/Client)`,
    `[#missing](${origin}/channels/missing)`,
    `[#team/Client](${origin}/users/team/Client)`,
    `[#team/Client](https://user:password@traq.example/channels/team/Client)`,
    `[#team/Client](${origin}/channels/team/Client?foo=bar)`,
    `[#team/Client](${origin}/channels/team/Client#heading)`,
    `[#team/Client](${origin}/channels/team/%xx)`,
    `[team/Client](${origin}/channels/team/Client)`,
    `\\${link}`,
    `!${link}`,
    `\`${link}\``,
    `\`\`\`md\n${link}\n\`\`\``,
    `    ${link}`,
    `$${link}$`,
    `$$\n${link}\n$$`
  ])('leaves ordinary links and protected Markdown unchanged: %s', text => {
    expect(parse(text)).toBeUndefined()
  })

  it.each([
    ['`', '`'],
    ['```md\n', '\n```'],
    ['$$\n', '\n$$'],
    ['$', '$'],
    ['\\', ''],
    ['    ', '']
  ])('respects the destination context %j … %j', (before, after) => {
    expect(parse(link, before, after)).toBeUndefined()
  })

  it('resolves percent-encoded paths using the displayed channel name', () => {
    expect(
      parse(link.replace('/channels/team/Client', '/channels/team/%43lient'))
    ).toEqual([reference])
  })
})
