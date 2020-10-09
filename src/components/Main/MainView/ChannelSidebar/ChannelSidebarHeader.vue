<template>
  <div :class="$style.container">
    <icon
      v-if="showBackButton"
      :height="28"
      :width="28"
      mdi
      name="chevron-left"
      @click="$emit('back')"
      :class="$style.backButton"
    />
    <channel-sidebar-header-name
      :channel-name="state.channelName"
      :show-hash="state.showHash"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import ChannelSidebarHeaderName from './ChannelSidebarHeaderName.vue'

export default defineComponent({
  name: 'ChannelSidebarHeader',
  emits: {
    back: () => true
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: false },
    title: { type: String, default: 'チャンネル' },
    showBackButton: { type: Boolean, default: false }
  },
  components: { ChannelSidebarHeaderName, Icon },
  setup(props) {
    const state = reactive({
      channelName: computed(
        () =>
          store.state.entities.channels[props.channelId ?? '']?.name ??
          props.title
      ),
      showHash: computed(() => !!props.channelId)
    })
    return { state }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
.backButton {
  flex-shrink: 0;
  margin-right: 8px;
  cursor: pointer;
}
</style>
