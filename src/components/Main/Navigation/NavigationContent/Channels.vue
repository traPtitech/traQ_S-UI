<template>
  <div>
    チャンネル検索
    <channel-filter
      @click="toggleStar"
      @input="setQuery"
      :text="channelListFilterState.query"
      :is-stared="state.isStar"
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
    <channel-list
      v-show="channelListFilterState.query.length <= 0 && state.isStar"
      :channels="tree"
    />
    <channel-list
      v-show="channelListFilterState.query.length <= 0 && !state.isStar"
      :channels="topLevelChannels"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import ChannelFilteredElement from '../ChannelList/ChannelFilteredElement.vue'
import { constructTree } from '@/store/domain/channelTree/actions'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import Icon from '@/components/UI/Icon.vue'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import useChannelPath from '@/use/channelPath'

const useChannelListFilter = () => {
  const channels = computed(() => Object.values(store.state.entities.channels))
  const { textFilterState, setQuery } = useTextFilter(channels, 'name')
  return {
    channelListFilterState: textFilterState,
    setQuery
  }
}

const useStaredChannel = () => {
  const staredChannel = computed(() =>
    Object.keys(store.state.domain.me.staredChannelSet).map(
      v => store.state.entities.channels[v]
    )
  )

  const sortChannelTreeNode = (a: ChannelTreeNode, b: ChannelTreeNode) => {
    const nameA = a.name.toUpperCase()
    const nameB = b.name.toUpperCase()

    let comparison = 0
    if (nameA > nameB) {
      comparison = 1
    } else if (nameA < nameB) {
      comparison = -1
    }
    return comparison
  }

  const tree = computed(
    () =>
      staredChannel.value
        .map(ch => {
          const _tree =
            constructTree(ch, store.state.entities.channels) ??
            ({} as ChannelTreeNode)

          const { channelIdToShortPathString } = useChannelPath()
          const path = channelIdToShortPathString(ch.id)

          _tree.name = path
          return _tree
        })
        .sort(sortChannelTreeNode) as ChannelTreeNode[]
  )

  return { tree }
}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    FilterInput,
    ChannelFilteredElement,
    Icon,
    ChannelFilter
  },
  setup() {
    const topLevelChannels = computed(() => {
      return store.state.domain.channelTree.channelTree.children ?? []
    })

    const state = reactive({
      isStar: false
    })
    const toggleStar = () => {
      state.isStar = !state.isStar
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
      tree,
      toggleStar,
      state
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
.container {
  display: flex;
}
</style>
