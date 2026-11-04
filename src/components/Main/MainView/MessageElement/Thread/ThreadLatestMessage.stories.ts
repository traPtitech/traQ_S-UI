import type { User } from '@traptitech/traq'

import { createMemoryHistory, createRouter, routerKey } from 'vue-router'

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'

import { initializeMeta } from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useMessagesStore } from '/@/store/entities/messages'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import ThreadLatestMessage from './ThreadLatestMessage.vue'
import ThreadSummaryCard from './ThreadSummaryCard.vue'

setup(app => {
  app.provide(
    routerKey,
    createRouter({ history: createMemoryHistory(), routes: [] })
  )
})

const author: User = {
  id: '20000000-0000-4000-8000-000000000001',
  name: 'alice',
  displayName: 'ありす',
  iconFileId: 'android-chrome-192x192.png',
  state: 1,
  bot: false,
  updatedAt: '2026-10-01T00:00:00Z'
}

const fileId = '50000000-0000-4000-8000-000000000001'

type StoryArgs = InstanceType<typeof ThreadLatestMessage>['$props'] & {
  width: number
  inCard: boolean
  onOpen: () => void
}

const meta = {
  title: 'Main/Message/ThreadLatestMessage',
  component: ThreadLatestMessage,
  args: {
    latestMessage: {
      content: 'これは最後のメッセージ'.repeat(5),
      userId: author.id
    },
    width: 347,
    inCard: false,
    onOpen: fn()
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 120, max: 800, step: 8 },
      description: '表示幅（px）',
      table: { category: 'Story' }
    },
    inCard: {
      control: 'boolean',
      description: 'スレッド概要カードのスロットに配置',
      table: { category: 'Story' }
    }
  },
  parameters: {
    controls: { include: ['latestMessage', 'width', 'inCard'] },
    docs: {
      description: {
        component:
          '最新メッセージの userId から投稿者アイコンを表示し、本文を1行で表示します。最新投稿がなければ何も表示しません。履歴取得や WebSocket 購読は行わず、本文は既存の RenderContent で描画します。'
      }
    }
  },
  beforeEach: async () => {
    window.traQConfig = { ...window.traQConfig, backendOrigin: location.origin }
    await initializeMeta()
  },
  render: args => ({
    components: { ThreadLatestMessage, ThreadSummaryCard },
    setup() {
      // Markdown が待つ初期データを用意し、バックエンドへの接続を不要にする。
      const users = useUsersStore()

      users.usersMap.value.set(author.id, author)
      users.usersMapInitialFetchPromise = Promise.resolve()

      useChannelsStore().bothChannelsMapInitialFetchPromise = Promise.resolve()
      useGroupsStore().userGroupsMapInitialFetchPromise = Promise.resolve()
      useStampsStore().stampsMapInitialFetchPromise = Promise.resolve()
      useMessagesStore().fileMetaDataMap.value.set(fileId, {
        id: fileId,
        name: 'attachment.png',
        mime: 'image/png',
        size: 1024,
        md5: '',
        isAnimatedImage: false,
        createdAt: author.updatedAt,
        thumbnails: [],
        thumbnail: null,
        channelId: null,
        uploaderId: author.id
      })
      return { args }
    },
    template: `
      <article :style="{ width: args.width + 'px', maxWidth: '100%' }">
        <div v-if="args.inCard" style="display: flex; gap: 10px; font-size: 14px;">
          <img
            src="/img/icons/android-chrome-192x192.png"
            width="40"
            height="40"
            alt=""
            style="flex-shrink: 0; border-radius: 50%;"
          />
          <div style="min-width: 0;">
            <strong style="color: var(--theme-ui-primary-default);">ありす</strong>
            <p>これはスレッドの起点となるメッセージです</p>
          </div>
        </div>
        <ThreadSummaryCard v-if="args.inCard" title="スレッドタイトルスレッドタイトル" @open="args.onOpen">
          <template #badge>
            <span style="color: var(--theme-accent-primary-default); font-weight: bold;">+5</span>
          </template>
          <ThreadLatestMessage :latest-message="args.latestMessage" />
        </ThreadSummaryCard>
        <ThreadLatestMessage v-else :latest-message="args.latestMessage" />
      </article>
    `
  })
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Markdown: Story = {
  args: {
    latestMessage: {
      content:
        '**太字** と `code`、[リンク](https://example.com)\n2行目も1行で表示します。',
      userId: author.id
    }
  }
}

export const Mention: Story = {
  args: {
    latestMessage: {
      content: `!{"type":"user","raw":"@alice","id":"${author.id}"} 確認をお願いします。`,
      userId: author.id
    }
  }
}

export const AttachmentOnly: Story = {
  args: {
    latestMessage: {
      content: `${location.origin}/files/${fileId}`,
      userId: author.id
    }
  }
}

export const NoLatestMessage: Story = {
  args: { latestMessage: undefined }
}

export const Narrow: Story = {
  args: {
    width: 180
  }
}

export const InSummaryCard: Story = {
  args: {
    inCard: true,
    width: 456
  }
}

export const NarrowSummaryCard: Story = {
  args: { inCard: true, width: 280 }
}

export const Dark: Story = {
  globals: { theme: 'dark' }
}
