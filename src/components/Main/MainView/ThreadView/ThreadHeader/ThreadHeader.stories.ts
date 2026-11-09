import { createMemoryHistory, createRouter } from 'vue-router'

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'

import { useChannelsStore } from '/@/store/entities/channels'
import type { ThreadChannel } from '/@/store/entities/threads'
import { useThreadsStore } from '/@/store/entities/threads'

import ThreadHeader from './ThreadHeader.vue'

setup(app => {
  app.use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }]
    })
  )
})

const channels = [
  {
    id: 'thread-header-root',
    name: 'team',
    parentId: null,
    parentMessageId: null,
    children: ['thread-header-parent'],
    topic: '',
    archived: false,
    force: false
  },
  {
    id: 'thread-header-parent',
    name: 'traQ',
    parentId: 'thread-header-root',
    parentMessageId: null,
    children: ['thread-header-channel'],
    topic: '',
    archived: false,
    force: false
  },
  {
    id: 'thread-header-channel',
    name: 'client',
    parentId: 'thread-header-parent',
    parentMessageId: null,
    children: [],
    topic: '',
    archived: false,
    force: false
  }
]

const thread: ThreadChannel = {
  id: 'thread-header-thread',
  name: 'スレッドヘッダーのデザイン',
  parentId: 'thread-header-channel',
  parentMessageId: 'thread-header-parent-message',
  children: [],
  topic: '',
  archived: false,
  force: false
}
const threads: ThreadChannel[] = [
  thread,
  { ...thread, id: 'thread-header-top-level', parentId: 'thread-header-root' },
  {
    ...thread,
    id: 'thread-header-long-name',
    name: 'とっても長い名前のスレッドでもいい感じにスクロールすることで名前が全部見れるといいな'
  }
]

const meta = {
  title: 'Main/ThreadView/ThreadHeader',
  component: ThreadHeader,
  args: {
    channelId: thread.id
  },
  render: args => ({
    components: { ThreadHeader },
    setup() {
      const { channelsMap, bothChannelsMapFetched } = useChannelsStore()
      const { threadsMap } = useThreadsStore()
      channelsMap.value = new Map(
        channels.map(channel => [channel.id, channel])
      )
      bothChannelsMapFetched.value = true
      threadsMap.value = new Map(threads.map(thread => [thread.id, thread]))
      return { args }
    },
    template: '<ThreadHeader v-bind="args" />'
  })
} satisfies Meta<typeof ThreadHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TopLevelChannel: Story = {
  args: {
    channelId: 'thread-header-top-level'
  }
}

export const LongThreadName: Story = {
  args: {
    channelId: 'thread-header-long-name'
  }
}
