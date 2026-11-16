import type {
  Message,
  ThreadChannel,
  UnreadChannel,
  User,
  UserSubscribeState
} from '@traptitech/traq'
import { ChannelSubscribeLevel } from '@traptitech/traq'

export const mockThreadParentChannelId = '10000000-0000-4000-8000-000000000001'

export const mockThreadUsers: User[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'alice',
    displayName: 'ありす',
    iconFileId: '60000000-0000-4000-8000-000000000001',
    bot: false,
    state: 1,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'bob',
    displayName: '表示名がとても長いユーザーの折り返し確認用',
    iconFileId: '60000000-0000-4000-8000-000000000002',
    bot: false,
    state: 1,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'charlie',
    displayName: 'ちゃーりー',
    iconFileId: '60000000-0000-4000-8000-000000000003',
    bot: false,
    state: 1,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    name: 'diana',
    displayName: 'だいあな',
    iconFileId: '60000000-0000-4000-8000-000000000004',
    bot: false,
    state: 1,
    updatedAt: '2026-10-01T00:00:00Z'
  }
]

export const mockThreads: ThreadChannel[] = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000001',
    archived: false,
    creatorId: '20000000-0000-4000-8000-000000000001',
    name: '次回のミーティング'
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000002',
    archived: false,
    creatorId: '20000000-0000-4000-8000-000000000002',
    name: 'サイドバーのデザイン相談'
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000003',
    archived: false,
    creatorId: '20000000-0000-4000-8000-000000000003',
    name: '動作確認メモ'
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000004',
    archived: false,
    creatorId: '20000000-0000-4000-8000-000000000002',
    name: 'タイトルが長いスレッドをサイドバーに表示したときの省略と折り返しを確認するための相談'
  },
  {
    id: '30000000-0000-4000-8000-000000000005',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000005',
    archived: false,
    creatorId: '20000000-0000-4000-8000-000000000004',
    name: 'リリース後の振り返り'
  },
  {
    id: '30000000-0000-4000-8000-000000000006',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000006',
    archived: true,
    creatorId: '20000000-0000-4000-8000-000000000001',
    name: '今日アーカイブしたミーティング'
  },
  {
    id: '30000000-0000-4000-8000-000000000007',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000007',
    archived: true,
    creatorId: '20000000-0000-4000-8000-000000000002',
    name: '解決済みの不具合相談'
  },
  {
    id: '30000000-0000-4000-8000-000000000008',
    parentChannelId: '10000000-0000-4000-8000-000000000001',
    parentMessageId: '40000000-0000-4000-8000-000000000008',
    archived: true,
    creatorId: '20000000-0000-4000-8000-000000000004',
    name: '終了したイベントの準備'
  }
]

const mockParentMessages: Pick<
  Message,
  'id' | 'userId' | 'content' | 'createdAt'
>[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    userId: '20000000-0000-4000-8000-000000000001',
    content:
      '次回のミーティングで相談したいことがあるので、議題をまとめましょう。',
    createdAt: '2026-10-29T08:30:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    userId: '20000000-0000-4000-8000-000000000001',
    content:
      'サイドバーの案を見比べて、タイトルと本文の見え方を確認したいです。',
    createdAt: '2026-10-29T08:35:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    userId: '20000000-0000-4000-8000-000000000001',
    content:
      '気づいたことがあれば、このスレッドに動作確認のメモを残してください。',
    createdAt: '2026-10-29T08:40:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000004',
    userId: '20000000-0000-4000-8000-000000000001',
    content: 'PR出しました\nhttps://github.com/traPtitech/traQ/pull/3620',
    createdAt: '2026-10-29T08:42:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000006',
    userId: '20000000-0000-4000-8000-000000000001',
    content: 'ミーティングの記録と次回までに進める作業をここにまとめます。',
    createdAt: '2026-10-29T08:44:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000007',
    userId: '20000000-0000-4000-8000-000000000001',
    content: '同じ手順で再現するか、確認した結果を教えてください。',
    createdAt: '2026-10-29T08:46:00.000Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000008',
    userId: '20000000-0000-4000-8000-000000000001',
    content:
      'イベント準備の分担と当日までの進捗をこのスレッドで共有しましょう。',
    createdAt: '2026-10-29T08:48:00.000Z'
  }
]

// 末尾を最新投稿として使うため、各スレッドの投稿を古い順に並べる。
export const mockThreadMessages: Message[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000001',
    threadId: '30000000-0000-4000-8000-000000000001',
    content: '次回のミーティング、何時からにしましょうか？ :thumbsup:',
    createdAt: '2026-10-29T08:45:00.000Z',
    updatedAt: '2026-10-29T08:45:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000001',
    threadId: '30000000-0000-4000-8000-000000000001',
    content: '18時以降なら参加できます。議題もまとめておきます！',
    createdAt: '2026-10-29T08:50:00.000Z',
    updatedAt: '2026-10-29T08:50:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000003',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000001',
    threadId: '30000000-0000-4000-8000-000000000001',
    content: '自分も大丈夫です。進捗共有と次の作業の相談をしたいです。',
    createdAt: '2026-10-29T08:55:00.000Z',
    updatedAt: '2026-10-29T08:55:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000004',
    userId: '20000000-0000-4000-8000-000000000004',
    channelId: '30000000-0000-4000-8000-000000000001',
    threadId: '30000000-0000-4000-8000-000000000001',
    content: '明日のミーティングは18時からでお願いします！',
    createdAt: '2026-10-29T09:00:00.000Z',
    updatedAt: '2026-10-29T09:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000005',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000002',
    threadId: '30000000-0000-4000-8000-000000000002',
    content:
      '**表示案**を作りました。通常スタンプ :tada: とエフェクト付き :tada.large: の表示を確認したいです。',
    createdAt: '2026-10-29T08:15:00.000Z',
    updatedAt: '2026-10-29T08:15:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000006',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000002',
    threadId: '30000000-0000-4000-8000-000000000002',
    content: '最新の発言者と投稿時刻も見えるとうれしいです。',
    createdAt: '2026-10-29T08:20:00.000Z',
    updatedAt: '2026-10-29T08:20:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000007',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000002',
    threadId: '30000000-0000-4000-8000-000000000002',
    content: 'タイトルが長い場合と、本文が複数行の場合も確認しましょう。',
    createdAt: '2026-10-29T08:25:00.000Z',
    updatedAt: '2026-10-29T08:25:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000008',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000002',
    threadId: '30000000-0000-4000-8000-000000000002',
    content:
      'スレッドのタイトルと最新メッセージを並べたときに、本文が長くなっても読みやすいように省略表示や余白を調整したいです。まずはこの文章で表示を確認してみます。',
    createdAt: '2026-10-29T08:30:00.000Z',
    updatedAt: '2026-10-29T08:30:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000013',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000004',
    threadId: '30000000-0000-4000-8000-000000000004',
    content: ':thumbsup: :tada:',
    createdAt: '2026-10-28T10:45:00.000Z',
    updatedAt: '2026-10-28T10:45:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000014',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000004',
    threadId: '30000000-0000-4000-8000-000000000004',
    content: 'サイドバーでは2行まで表示する案はどうでしょうか？',
    createdAt: '2026-10-28T10:50:00.000Z',
    updatedAt: '2026-10-28T10:50:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000015',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000004',
    threadId: '30000000-0000-4000-8000-000000000004',
    content:
      'よさそうです。詳細を開いたときにはタイトル全体を確認できると助かります。',
    createdAt: '2026-10-28T10:55:00.000Z',
    updatedAt: '2026-10-28T10:55:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000016',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000004',
    threadId: '30000000-0000-4000-8000-000000000004',
    content: 'こちらの案で進めましょう。',
    createdAt: '2026-10-28T11:00:00.000Z',
    updatedAt: '2026-10-28T11:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000017',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000005',
    threadId: '30000000-0000-4000-8000-000000000005',
    content: 'リリース作業おつかれさまでした！ 気づいた点を共有しましょう。',
    createdAt: '2026-10-27T05:45:00.000Z',
    updatedAt: '2026-10-27T05:45:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000018',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000005',
    threadId: '30000000-0000-4000-8000-000000000005',
    content: '事前に確認項目をまとめておいたので、動作確認がスムーズでした。',
    createdAt: '2026-10-27T05:50:00.000Z',
    updatedAt: '2026-10-27T05:50:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000019',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000005',
    threadId: '30000000-0000-4000-8000-000000000005',
    content: '次回は画面幅ごとの確認も追加しておきたいです。',
    createdAt: '2026-10-27T05:55:00.000Z',
    updatedAt: '2026-10-27T05:55:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000020',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000005',
    threadId: '30000000-0000-4000-8000-000000000005',
    content: '対応ありがとうございました！ 🎉',
    createdAt: '2026-10-27T06:00:00.000Z',
    updatedAt: '2026-10-27T06:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000021',
    userId: '20000000-0000-4000-8000-000000000001',
    channelId: '30000000-0000-4000-8000-000000000006',
    threadId: '30000000-0000-4000-8000-000000000006',
    content: '今日のミーティングの議事録を確認しましょう。',
    createdAt: '2026-10-29T10:00:00.000Z',
    updatedAt: '2026-10-29T10:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000022',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000006',
    threadId: '30000000-0000-4000-8000-000000000006',
    content: '確認が終わったので、このスレッドをアーカイブします。',
    createdAt: '2026-10-29T10:05:00.000Z',
    updatedAt: '2026-10-29T10:05:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000023',
    userId: '20000000-0000-4000-8000-000000000002',
    channelId: '30000000-0000-4000-8000-000000000007',
    threadId: '30000000-0000-4000-8000-000000000007',
    content: '通知が届かない件について調べています。',
    createdAt: '2026-10-25T09:00:00.000Z',
    updatedAt: '2026-10-25T09:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000024',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000007',
    threadId: '30000000-0000-4000-8000-000000000007',
    content:
      '修正後の動作を確認しました。対応ありがとうございます！ :thumbsup:',
    createdAt: '2026-10-25T09:05:00.000Z',
    updatedAt: '2026-10-25T09:05:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000025',
    userId: '20000000-0000-4000-8000-000000000003',
    channelId: '30000000-0000-4000-8000-000000000008',
    threadId: '30000000-0000-4000-8000-000000000008',
    content: 'イベント当日の準備について相談しましょう。',
    createdAt: '2026-10-24T09:00:00.000Z',
    updatedAt: '2026-10-24T09:00:00.000Z',
    pinned: false,
    stamps: []
  },
  {
    id: '50000000-0000-4000-8000-000000000026',
    userId: '20000000-0000-4000-8000-000000000004',
    channelId: '30000000-0000-4000-8000-000000000008',
    threadId: '30000000-0000-4000-8000-000000000008',
    content: 'イベントは無事終了しました。おつかれさまでした！ :tada:',
    createdAt: '2026-10-24T09:05:00.000Z',
    updatedAt: '2026-10-24T09:05:00.000Z',
    pinned: false,
    stamps: []
  }
]

const mockThreadNotificationStates = [
  { count: 3, noticeable: true, level: ChannelSubscribeLevel.notified },
  { count: 2, noticeable: false, level: ChannelSubscribeLevel.subscribed },
  { count: 0, noticeable: false, level: ChannelSubscribeLevel.none },
  { count: 120, noticeable: false, level: ChannelSubscribeLevel.notified },
  { count: 1, noticeable: true, level: ChannelSubscribeLevel.none },
  { count: 2, noticeable: false, level: ChannelSubscribeLevel.subscribed },
  { count: 0, noticeable: false, level: ChannelSubscribeLevel.notified },
  { count: 0, noticeable: false, level: ChannelSubscribeLevel.none }
]

const getMockThreadNotificationState = (index: number) => {
  const state = mockThreadNotificationStates[index]
  if (!state) throw new Error('通知設定のモックがありません')
  return state
}

export const mockThreadSubscriptions: UserSubscribeState[] =
  mockThreads.flatMap((thread, index) => {
    const { level } = getMockThreadNotificationState(index)
    if (level === ChannelSubscribeLevel.none) return []
    return [{ channelId: thread.id, level }]
  })

export const mockThreadUnreadChannels: UnreadChannel[] = mockThreads.flatMap(
  (thread, index) => {
    const { count, noticeable } = getMockThreadNotificationState(index)
    if (count === 0) return []
    const messages = mockThreadMessages.filter(
      message => message.channelId === thread.id
    )
    const oldestMessage = messages[0]
    const latestMessage = messages.at(-1)
    if (!oldestMessage || !latestMessage) {
      throw new Error('未読メッセージのモックがありません')
    }
    return [
      {
        channelId: thread.id,
        count,
        noticeable,
        since: oldestMessage.createdAt,
        updatedAt: latestMessage.createdAt,
        oldestMessageId: oldestMessage.id
      }
    ]
  }
)

export const getMockThreadMessages = (threadId: string): Message[] =>
  mockThreadMessages.filter(message => message.channelId === threadId)

export const getMockThreadItems = (
  parentChannelId = mockThreadParentChannelId
) =>
  mockThreads.map(thread => {
    const creator = mockThreadUsers.find(user => user.id === thread.creatorId)
    const parentMessage = mockParentMessages.find(
      message => message.id === thread.parentMessageId
    )
    const parentAuthor = mockThreadUsers.find(
      user => user.id === parentMessage?.userId
    )

    return {
      thread: { ...thread, parentChannelId },
      latestMessage: getMockThreadMessages(thread.id).at(-1),
      creator,
      parentPreview:
        parentMessage && parentAuthor
          ? { message: parentMessage, author: parentAuthor }
          : undefined,
      unread: mockThreadUnreadChannels.find(
        unread => unread.channelId === thread.id
      ),
      subscription: mockThreadSubscriptions.find(
        subscription => subscription.channelId === thread.id
      )
    }
  })
