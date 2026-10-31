import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'

import ThreadSummaryCard from './ThreadSummaryCard.vue'
import ThreadUnreadBadge from './ThreadUnreadBadge.vue'

type StoryArgs = Pick<
  InstanceType<typeof ThreadSummaryCard>['$props'],
  'title' | 'onOpen'
> & {
  width: number
  showSlots: boolean
  unreadCount: number
}

const meta = {
  title: 'Main/Message/ThreadSummaryCard',
  component: ThreadSummaryCard,
  args: {
    title: 'スレッドタイトル',
    onOpen: fn(),
    width: 456,
    showSlots: false,
    unreadCount: 5
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 240, max: 800, step: 8 },
      description: '親メッセージを含む表示幅（px）',
      table: { category: 'Story' }
    },
    showSlots: {
      control: 'boolean',
      description: 'バッジと最新メッセージの代わりに仮の要素を表示',
      table: { category: 'Story' }
    },
    unreadCount: {
      control: { type: 'number', min: 0 },
      description: '未読件数',
      table: { category: 'Story' }
    }
  },
  parameters: {
    controls: { include: ['title', 'width', 'showSlots', 'unreadCount'] },
    docs: {
      description: {
        component:
          '親メッセージに付くスレッドの概要カード。未読バッジと最新メッセージはスロットで受け取ります。'
      }
    }
  },
  render: args => ({
    components: { ThreadSummaryCard, ThreadUnreadBadge },
    setup: () => ({ args }),
    template: `
      <article :style="{ width: args.width + 'px', maxWidth: '100%' }">
        <div style="display: flex; gap: 10px; font-size: 14px;">
          <span
            aria-hidden="true"
            style="display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--theme-accent-primary-default); color: white;"
          >T</span>
          <div style="min-width: 0;">
            <strong style="color: var(--theme-ui-primary-default);">traQ user</strong>
            <p>これはスレッドの起点となるメッセージです</p>
          </div>
        </div>
        <ThreadSummaryCard :title="args.title" @open="args.onOpen">
          <template #badge>
            <ThreadUnreadBadge :unread-count="args.unreadCount" />
          </template>
          <template v-if="args.showSlots" #default>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span
                aria-hidden="true"
                style="display: grid; place-items: center; flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--theme-accent-primary-default); color: white; font-size: 12px;"
              >T</span>
              <span style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;">
                これは最新メッセージの代わりに表示している仮の内容です
              </span>
            </span>
          </template>
        </ThreadSummaryCard>
      </article>
    `
  })
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongTitle: Story = {
  args: {
    title: '長いスレッドタイトル'.repeat(10)
  }
}

export const Narrow: Story = {
  args: {
    title: '長いスレッドタイトル'.repeat(10),
    width: 280
  }
}

export const Dark: Story = {
  globals: {
    theme: 'dark'
  }
}

export const WithSlots: Story = {
  args: {
    showSlots: true
  },
  parameters: {
    docs: {
      description: {
        story:
          'バッジと最新メッセージは別 issue の担当範囲のため、スロットの配置確認用に仮の要素を表示しています。'
      }
    }
  }
}

export const NoUnread: Story = {
  args: {
    showSlots: true,
    unreadCount: 0
  }
}

export const ManyUnread: Story = {
  args: {
    showSlots: true,
    unreadCount: 100
  },
  parameters: {
    docs: {
      description: {
        story: '100件以上の未読は、表示上は +99 に丸められます。'
      }
    }
  }
}
