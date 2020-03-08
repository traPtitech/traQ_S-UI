import store from '@/store'
import { computed, ref } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'

const rootChannelId = ''
const dmChannelId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'

type RootChannelId = typeof rootChannelId
type DmChannelId = typeof dmChannelId

export type ChannelTreeNode = {
  channelId: ChannelId
  name: string
  children?: ChannelTreeNode[]
}
export type ChannelTree<Root> = {
  channelId: Root
  name: string
  children: ChannelTreeNode[]
}

const constructTree = (channel: {
  channelId?: ChannelId
  children?: readonly ChannelId[]
  name?: string
}): ChannelTreeNode => {
  const childrenCopied = [...(channel?.children ?? [])]
  console.log(childrenCopied)
  return {
    channelId: channel?.channelId ?? '',
    name: channel?.name ?? '',
    children: childrenCopied
      ?.sort((id1, id2) => {
        // sort by channel name
        const name1 =
          store.state.entities.channels[id1].name?.toUpperCase() ?? ''
        const name2 =
          store.state.entities.channels[id2].name?.toUpperCase() ?? ''
        return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
      })
      .map(id => constructTree(store.state.entities.channels[id]))
  }
}

const useChannelTree = () => {
  const channelTree = computed<ChannelTree<RootChannelId>>(() => ({
    channelId: rootChannelId,
    name: '',
    children:
      constructTree(store.state.entities.channels[rootChannelId]).children ?? []
  }))
  return { channelTree }
}

export default useChannelTree
