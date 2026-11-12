import type { Channel } from '@traptitech/traq'

import type { ChannelFixture } from './harness'

const pad = (index: number) => String(index).padStart(4, '0')
export const flatId = (index: number) => `flat-${pad(index)}`
export const childId = (index: number) => `child-${pad(index)}`
export const trailingId = (index: number) => `trailing-${pad(index)}`

export const longTopic =
  'This is a long topic with a project description and links to related documentation. '.repeat(
    5
  )

export const topics = [
  '',
  'Short description',
  '[wiki](https://example.invalid) | Channel description and related documents',
  longTopic
]

const channel = (id: string, overrides: Partial<Channel> = {}): Channel => ({
  id,
  name: id,
  parentId: null,
  parentMessageId: null,
  children: [],
  archived: false,
  force: false,
  topic: '',
  ...overrides
})

export const createChannels = ({
  scenario = 'flat',
  count = 1200,
  topics: withTopics = true
}: ChannelFixture): Channel[] => {
  if (scenario === 'flat') {
    return Array.from({ length: count }, (_, i) =>
      channel(flatId(i), {
        name: `channel-${pad(i)}`,
        topic: withTopics ? topics[i % topics.length] : ''
      })
    )
  }

  const children = Array.from({ length: count }, (_, i) =>
    channel(childId(i), {
      parentId: 'branch',
      name: `child-${pad(i)}`,
      topic: withTopics ? topics[i % topics.length] : '',
      children: i === 0 ? ['grandchild'] : []
    })
  )

  return [
    channel('branch', {
      name: 'a-branch',
      children: children.map(c => c.id),
      topic: withTopics ? 'Parent topic' : ''
    }),

    ...children,
    channel('grandchild', { parentId: childId(0), topic: 'Grandchild topic' }),

    ...Array.from({ length: 300 }, (_, i) =>
      channel(trailingId(i), {
        name: `z-trailing-${pad(i)}`,
        topic: withTopics ? topics[i % topics.length] : ''
      })
    )
  ]
}
