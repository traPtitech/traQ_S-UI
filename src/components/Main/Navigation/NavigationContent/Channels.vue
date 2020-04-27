<template>
  <div>
    チャンネル検索
    <!-- {{ staredChannel }} -->
    <filter-input
      :on-secondary="true"
      :text="channelListFilterState.query"
      @input="setQuery"
      :class="$style.input"
    />
    <div v-show="channelListFilterState.query.length > 0" :class="$style.list">
      <div
        v-for="channel in channelListFilterState.filteredItems"
        :key="channel.id"
      >
        <channel-filtered-element
          :name="channel.name"
          :topic="channel.topic"
          :id="channel.id"
          :is-current="channelId == channel.id"
          :class="$style.element"
        />
      </div>
    </div>
    <button @click="test(tree)">button</button>
    <channel-list
      v-show="channelListFilterState.query.length <= 0"
      :channels="tree.children"
    />
    <!-- <channel-list
      v-show="channelListFilterState.query.length <= 0"
      :channels="topLevelChannels"
    /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import ChannelFilteredElement from '../ChannelList/ChannelFilteredElement.vue'
import { constructTree } from '../../../../store/domain/channelTree/actions'
import { ChannelTreeNode } from '../../../../store/domain/channelTree/state'

const useChannelListFilter = () => {
  const channels = computed(() => Object.values(store.state.entities.channels))
  const { textFilterState, setQuery } = useTextFilter(channels, 'name')
  return {
    channelListFilterState: textFilterState,
    setQuery
  }
}

const useStaredChannel = () => {
  const staredChannelId = computed(() =>
    Object.keys(store.state.domain.me.staredChannelSet).map(
      v => store.state.entities.channels[v]
    )
  )

  const buildPath = (parentid: string | null, name: string): string => {
    if (parentid != null) {
      const parentCh = store.state.entities.channels[parentid]
      name = parentCh.name[0] + '/' + name
      if (parentCh.parentId) {
        return buildPath(parentCh.parentId, name)
      }
    }
    return name
  }
  const tree = computed(() => {
    return {
      children: staredChannelId.value.map(ch => {
        const tree = constructTree(ch, store.state.entities.channels)
        if (tree != undefined) {
          const path = buildPath(ch.parentId, ch.name)
          tree.name = path
        }
        return tree
      }) as ChannelTreeNode[]
    }
  })

  return { tree }
}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    FilterInput,
    ChannelFilteredElement
  },
  setup() {
    const topLevelChannels = computed(() => {
      return store.state.domain.channelTree.channelTree.children ?? []
    })
    // const staredChannel = computed(() =>
    //   Object.keys(store.state.domain.me.staredChannelSet).map(
    //     v => store.state.entities.channels[v]
    //   )
    // )
    // const tree = computed(() => {
    //   return {
    //     children: staredChannel.value.map(ch => {
    //       const tree = constructTree(ch, store.state.entities.channels)
    //       if (tree != undefined) {
    //         const path = buildPath(ch.parentId, ch.name)
    //         tree.name = path
    //       }
    //       return tree
    //     }) as ChannelTreeNode[]
    //   }
    // })

    // const buildPath = (parentid: string | null, name: string): string => {
    //   if (parentid != null) {
    //     const parentCh = store.state.entities.channels[parentid]
    //     name = parentCh.name[0] + '/' + name
    //     if (parentCh.parentId) {
    //       return buildPath(parentCh.parentId, name)
    //     }
    //   }
    //   return name
    // }

    const test = (test: any) => {
      console.log(test)
    }

    const { channelListFilterState, setQuery } = useChannelListFilter()
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { tree } = useStaredChannel()
    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
      channelId,
      // staredChannel,
      tree,
      test
    }
  }
})
</script>

<style lang="scss" module>
.element {
  cursor: pointer;
}
.list {
  margin: 16px 0px;
}
.input {
  margin-bottom: 16px;
}
</style>
