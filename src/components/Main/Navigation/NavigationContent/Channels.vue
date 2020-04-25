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
          :name="channel.name"
          :topic="channel.topic"
          :id="channel.id"
          :is-current="channelId == channel.id"
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
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ChannelList from '@/components/Main/Navigation/ChannelList/ChannelList.vue'
import useTextFilter from '@/use/textFilter'
import FilterInput from '@/components/UI/FilterInput.vue'
import ChannelFilteredElement from '../ChannelList/ChannelFilteredElement.vue'

const useChannelListFilter = () => {
  const channels = computed(() => Object.values(store.state.entities.channels))
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
    const { channelListFilterState, setQuery } = useChannelListFilter()
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    return {
      topLevelChannels,
      channelListFilterState,
      setQuery,
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
