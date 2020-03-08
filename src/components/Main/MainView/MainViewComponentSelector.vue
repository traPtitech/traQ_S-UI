<template>
  <messages-view
    v-if="viewInfo && viewInfo.type === 'messages'"
    :channelId="channelId"
  />
  <qall-view v-else-if="viewInfo && viewInfo.type === 'qall'" />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { LayoutType, ViewInformation } from '@/store/ui/mainView/state'
import { VNode } from 'vue'

import MessagesView from '@/components/Main/MainView/MessagesView.vue'
import QallView from '@/components/Main/MainView/QallView.vue'

type Props = {
  viewType?: ViewInformation
}

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { MessagesView, QallView },
  props: {
    viewInfo: Object
  },
  setup(props: Props) {
    const channelId = computed(() => store.state.app.currentChannelId)

    return {
      channelId
    }
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
