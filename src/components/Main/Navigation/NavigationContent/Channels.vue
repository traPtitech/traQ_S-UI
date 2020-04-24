<template>
  <div>
    チャンネル検索
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
          v-if="(channelId == channel.id)"
          :name="channel.name"
          :topic="channel.topic"
          :id="channel.id"
          :is-current="true"
        />
        <channel-filtered-element
          v-else
          :name="channel.name"
          :topic="channel.topic"
          :id="channel.id"
        />
      </div>
    </div>
    <channel-list
      v-show="channelListFilterState.query.length <= 0"
      :channels="topLevelChannels"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  set,
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import { Channel } from '@traptitech/traq'
import FilterInput from '@/components/UI/FilterInput.vue'
import ChannelFilteredElement from '../ChannelList/ChannelFilteredElement.vue'

const useChannelListFolding = () => {
  const state = reactive({
    channelListFoldingState: {} as Record<string, boolean>
  })
  const onUserListFoldingToggle = (userGroupName: string) => {
    if (state.channelListFoldingState[userGroupName]) {
      state.channelListFoldingState[userGroupName] = false
    } else {
      set(state.channelListFoldingState, userGroupName, true)
    }
  }
  return {
    ...toRefs(state),
    onUserListFoldingToggle
  }
}

const useChannelListFilter = () => {
  const channels = computed(
    () => Object.values(store.state.entities.channels) as Channel[]
  )
  const { textFilterState, setQuery } = useTextFilter(channels, 'name')
  return {
    channelListFilterState: textFilterState,
    setQuery
  }
}

export default defineComponent({
  name: 'Channels',
  components: {
    ChannelList,
    FilterInput,
    ChannelFilteredElement
  },
  setup() {
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )
    const {
      channelListFoldingState,
      onUserListFoldingToggle
    } = useChannelListFolding()
    const buildChildLink = (channel: string) =>
      `${location.pathname}/${channel}`
    const { channelListFilterState, setQuery } = useChannelListFilter()
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
      buildChildLink,
      channelId
    }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 8px 0;
}
.list {
  cursor: pointer;
  margin: 16px 0px;
}
.input {
  margin-bottom: 16px;
}
</style>
