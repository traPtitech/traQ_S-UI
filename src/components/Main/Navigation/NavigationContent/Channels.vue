<template>
  <div>
    <channel-filter
      @click="toggleStar"
      @input="setQuery"
      :text="channelListFilterState.query"
      :is-stared="state.isStar"
      :class="$style.filter"
    />
    <div v-if="channelListFilterState.query.length > 0" :class="$style.list">
      <channel-list
        :channels="channelListFilterState.filteredItems"
        ignore-children
        show-shortened-path
        show-topic
      />
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
import { constructTree } from '@/store/domain/channelTree/actions'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import useChannelPath from '@/use/channelPath'
import { compareString } from '@/lib/util/string'
import { Channel } from '@traptitech/traq'
import { buildDescendantsChannelArray } from '../use/buildChannel'
import useChannelState from '../../MainView/ChannelView/use/channelState'

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
      ? [
          ...new Set(
            Object.keys(store.state.domain.me.staredChannelSet)
              .filter(
                channelId =>
                  !useChannelState({ channelId }).channelState.archived
              )
              .flatMap(v => buildDescendantsChannelArray(v))
          )
        ]
      : Object.values(store.state.entities.channels).filter(
          channel =>
            !useChannelState({ channelId: channel.id }).channelState.archived
        )
  )

const useStaredChannel = () => {
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
          archived: false,
          children: Object.keys(store.state.domain.me.staredChannelSet).filter(
            channelId => !useChannelState({ channelId }).channelState.archived
          )
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
      () =>
        store.state.domain.channelTree.channelTree.children.filter(
          node => !node.archived
        ) ?? []
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
    const { channelIdToShortPathString } = useChannelPath()

    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
      currentChannelId,
      tree,
      toggleStar,
      state,
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
.list {
  margin: 16px 0px;
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
