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
          v-model:is-stared="filterStarChannel"
          :class="$style.filter"
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
import { computed, Ref } from 'vue'
import useChannelFilter from '/@/composables/useChannelFilter'
import { constructTree } from '/@/lib/channelTree'
import { buildDescendantsChannelArray } from '../composables/useBuildChannel'
import { useModalStore } from '/@/store/ui/modal'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

const useChannelList = (filterStarChannel: Ref<boolean>) => {
  const { staredChannelSet } = useMeStore()
  const { channelsMap } = useChannelsStore()
  return computed(() =>
    (filterStarChannel.value
      ? [
          ...new Set(
            [...staredChannelSet.value].flatMap(v =>
              buildDescendantsChannelArray(channelsMap.value, v, false)
            )
          )
        ]
      : [...channelsMap.value.values()]
    ).filter(ch => !ch.archived)
  )
}

const useTopLevelChannels = () => {
  const { channelTree } = useChannelTree()
  return computed(() =>
    channelTree.value.children.filter(channel => !channel.archived)
  )
}

const useStaredChannels = () => {
  const { staredChannelSet } = useMeStore()
  const { channelsMap } = useChannelsStore()
  return computed(
    () =>
      constructTree(
        {
          id: '',
          name: '',
          parentId: null,
          archived: false,
          children: [...staredChannelSet.value]
        },
        channelsMap.value
      )?.children.filter(channel => !channel.archived) ?? []
  )
}
</script>

<script lang="ts" setup>
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import ChannelFilter from '../ChannelList/ChannelFilter.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'

const { pushModal } = useModalStore()
const topLevelChannels = useTopLevelChannels()
const staredChannels = useStaredChannels()

const { filterStarChannel } = useBrowserSettings()
const { textFilterState: channelListFilterState } = useChannelFilter(
  useChannelList(filterStarChannel)
)

const onClickButton = () => {
  pushModal({
    type: 'channel-create'
  })
}
</script>

<style lang="scss" module>
.filter {
  margin-bottom: 16px;
}
.button {
  @include color-ui-secondary-inactive;
  padding-right: 16px;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
}
</style>
