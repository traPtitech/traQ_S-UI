export interface ChannelFixture {
  scenario?: 'flat' | 'tree'
  view?: 'channels' | 'tree' | 'home'
  topics?: boolean
  count?: number
  starredChannelIds?: string[]
}

declare global {
  interface Window {
    virtualScrollHarness: {
      ready: Promise<void>
      load: (fixture?: ChannelFixture) => Promise<void>
      setTopic: (id: string, topic: string) => Promise<void>
      setVisible: (visible: boolean) => Promise<void>
      setWidth: (width: number) => Promise<void>
      setHeaderHeight: (height: number) => Promise<void>
      setUnread: (count: number) => Promise<void>
    }
  }
}
