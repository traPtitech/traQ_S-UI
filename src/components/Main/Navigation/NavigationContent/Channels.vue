<template>
  <div>
    <channel-filter
      @toggle-star-filter="toggleStarChannelFilter"
      @input="setQuery"
      :text="channelListFilterState.query"
      :is-stared="filterStarChannel"
      :class="$style.filter"
    />
    <channel-list
      v-if="channelListFilterState.query.length > 0"
      :channels="channelListFilterState.filteredItems"
      ignore-children
      show-shortened-path
      show-topic
    />
    <channel-list v-else-if="filterStarChannel" :channels="tree" />
    <channel-list v-else :channels="topLevelChannels" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import { constructTree } from '@/store/domain/channelTree/actions'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import useChannelPath from '@/use/channelPath'
import { compareString } from '@/lib/util/string'
import { Channel } from '@traptitech/traq'
import { buildDescendantsChannelArray } from '../use/buildChannel'

const useChannelListFilter = (channels: Readonly<Ref<readonly Channel[]>>) => {
  const { textFilterState, setQuery } = useTextFilter(channels, 'name')
  return {
    channelListFilterState: textFilterState,
    setQuery
  }
}

const useFilterStarChannel = () => {
  const filterStarChannel = computed(
    () => store.state.app.browserSettings.filterStarChannel
  )

  const toggleStarChannelFilter = () => {
    store.commit.app.browserSettings.setFilterStarChannel(
      !filterStarChannel.value
    )
  }

  return {
    filterStarChannel,
    toggleStarChannelFilter
  }
}

const useChannels = (filterStarChannel: Ref<boolean>) =>
  computed(() =>
    filterStarChannel.value
      ? [
          ...new Set(
            Object.keys(store.state.domain.me.staredChannelSet).flatMap(v =>
              buildDescendantsChannelArray(v)
            )
          )
        ]
      : Object.values(store.state.entities.channels)
  )

const useStaredChannel = () => {
  const staredChannel = computed(() =>
    Object.keys(store.state.domain.me.staredChannelSet).map(
      v => store.state.entities.channels[v]
    )
  )

  const sortChannelTreeNode = (a: ChannelTreeNode, b: ChannelTreeNode) =>
    compareString(a.name.toUpperCase(), b.name.toUpperCase())

  const tree = computed(() => {
    const { channelIdToShortPathString } = useChannelPath()
    return (
      constructTree(
        {
          id: '',
          name: '',
          parentId: null,
          children: Object.keys(store.state.domain.me.staredChannelSet)
        },
        store.state.entities.channels
      )
        ?.children?.map(c => ({
          ...c,
          name: channelIdToShortPathString(c.id)
        }))
        .sort(sortChannelTreeNode) ?? []
    )
  })

  return { tree }
}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    FilterInput,
    ChannelFilter
  },
  setup() {
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )

    const {
      filterStarChannel,
      toggleStarChannelFilter
    } = useFilterStarChannel()

    const { channelListFilterState, setQuery } = useChannelListFilter(
      useChannels(filterStarChannel)
    )
    const currentChannelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { tree } = useStaredChannel()
    const { channelIdToShortPathString } = useChannelPath()

    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
      currentChannelId,
      tree,
      filterStarChannel,
      toggleStarChannelFilter,
      channelIdToShortPathString
    }
  }
})
</script>

<style lang="scss" module>
.element {
  cursor: pointer;
  margin: 8px 0;
}
.input {
  margin-bottom: 16px;
}
.container {
  display: flex;
}
.filter {
  margin-bottom: 16px;
}
</style>
