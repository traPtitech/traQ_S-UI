<template>
  <div>
    <navigation-content-container subtitle="チャンネルリスト">
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <a-icon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <channel-filter
          v-model="channelListFilterState.query"
          :is-stared="filterStarChannel"
          :class="$style.filter"
          @toggle-star-filter="toggleStarChannelFilter"
        />
        <template v-if="topLevelChannels.length > 0">
          <channel-list
            v-if="channelListFilterState.query.length > 0"
            :channels="channelListFilterState.filteredItems"
            ignore-children
            show-shortened-path
            show-topic
          />
          <template v-else-if="filterStarChannel">
            <channel-list
              v-if="staredChannels.length > 0"
              :channels="staredChannels"
              show-shortened-path
            />
            <empty-state v-else>お気に入りチャンネルはありません</empty-state>
          </template>
          <channel-list v-else :channels="topLevelChannels" />
        </template>
        <empty-state v-else>チャンネルがありません</empty-state>
      </template>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from 'vue'
import store from '/@/store'
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import useChannelFilter from '/@/use/channelFilter'
import { constructTree } from '/@/lib/channelTree'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import { Channel } from '@traptitech/traq'
import { buildDescendantsChannelArray } from '../use/buildChannel'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'

const useChannelListFilter = (channels: Readonly<Ref<readonly Channel[]>>) => {
  const { textFilterState } = useChannelFilter(channels)
  return {
    channelListFilterState: textFilterState
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
    (filterStarChannel.value
      ? [
          ...new Set(
            [...store.state.domain.me.staredChannelSet].flatMap(v =>
              buildDescendantsChannelArray(v, false)
            )
          )
        ]
      : [...store.state.entities.channelsMap.values()]
    ).filter(ch => !ch.archived)
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
          children: [...store.state.domain.me.staredChannelSet]
        },
        store.state.entities.channelsMap
      )?.children.filter(channel => !channel.archived) ?? []
  )

export default defineComponent({
  name: 'ChannelsTab',
  components: {
    NavigationContentContainer,
    ChannelList,
    ChannelFilter,
    AIcon,
    EmptyState
  },
  setup() {
    const topLevelChannels = useTopLevelChannels()
    const staredChannels = useStaredChannels()

    const { filterStarChannel, toggleStarChannelFilter } =
      useFilterStarChannel()
    const { channelListFilterState } = useChannelListFilter(
      useChannelList(filterStarChannel)
    )

    const onClickButton = () => {
      store.dispatch.ui.modal.pushModal({
        type: 'channel-create'
      })
    }

    return {
      onClickButton,
      toggleStarChannelFilter,
      filterStarChannel,
      channelListFilterState,
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
.button {
  @include color-ui-secondary;
  padding-right: 16px;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
