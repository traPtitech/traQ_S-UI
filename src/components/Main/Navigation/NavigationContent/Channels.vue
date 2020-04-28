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
          :is-current="currentChannelId == channel.id"
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
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import ChannelFilteredElement from '../ChannelList/ChannelFilteredElement.vue'
import { constructTree } from '@/store/domain/channelTree/actions'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import useChannelPath from '@/use/channelPath'
import { compareString } from '@/lib/util/string'
import { Channel } from '@traptitech/traq'

const useChannelListFilter = (channels: Readonly<Ref<readonly Channel[]>>) => {
  const { textFilterState, setQuery } = useTextFilter(channels, 'name')
  return {
    channelListFilterState: textFilterState,
    setQuery
  }
}

const useChannels = (state: { isStar: boolean }) =>
  computed(() =>
    state.isStar
      ? Object.keys(store.state.domain.me.staredChannelSet).map(
          v => store.state.entities.channels[v]
        )
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
    ChannelFilteredElement,
    ChannelFilter
  },
  setup() {
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )

    const state = reactive({
      isStar: false
    })
    const toggleStar = () => {
      state.isStar = !state.isStar
    }

    const { channelListFilterState, setQuery } = useChannelListFilter(
      useChannels(state)
    )
    const currentChannelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { tree } = useStaredChannel()

    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
      currentChannelId,
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
