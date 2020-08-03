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
    <channel-list
      v-else-if="filterStarChannel"
      :channels="staredChannels"
      show-shortened-path
    />
    <channel-list v-else :channels="topLevelChannels" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from 'vue'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import { constructTree } from '@/store/domain/channelTree/actions'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
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

const useChannelList = (filterStarChannel: Ref<boolean>) => {
  return computed(() =>
    filterStarChannel.value
      ? [
          ...new Set(
            Object.keys(store.state.domain.me.staredChannelSet).flatMap(v =>
              buildDescendantsChannelArray(v, false)
            )
          )
        ]
      : Object.values(store.state.entities.channels).filter(ch => !ch.archived)
  )
}

const useTopLevelChannels = () =>
  computed(
    () =>
      store.state.domain.channelTree.channelTree.children.filter(
        channel => !channel.archived
      ) ?? []
  )

const useStaredChannels = () =>
  computed(
    () =>
      constructTree(
        {
          id: '',
          name: '',
          parentId: null,
          archived: false,
          children: Object.keys(store.state.domain.me.staredChannelSet)
        },
        store.state.entities.channels
      )?.children.filter(channel => !channel.archived) ?? []
  )

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    ChannelFilter
  },
  setup() {
    const topLevelChannels = useTopLevelChannels()
    const staredChannels = useStaredChannels()

    const {
      filterStarChannel,
      toggleStarChannelFilter
    } = useFilterStarChannel()
    const { channelListFilterState, setQuery } = useChannelListFilter(
      useChannelList(filterStarChannel)
    )

    return {
      toggleStarChannelFilter,
      filterStarChannel,
      channelListFilterState,
      setQuery,
      staredChannels,
      topLevelChannels
    }
  }
})
</script>

<style lang="scss" module>
.filter {
  margin-bottom: 16px;
}
</style>
