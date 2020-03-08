<template>
  <div :class="$style.container">
    <MessagesView :channelId="state.channelId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { LayoutType, ViewInformation } from '@/store/ui/mainView/state'
import { VNode } from 'vue'

import MessagesView from '@/components/Main/MainView/MessagesView.vue'
import QallView from '@/components/Main/MainView/QallView.vue'

export default defineComponent({
  name: 'MainViewController',
  components: { MessagesView, QallView },
  setup() {
    const state = reactive({
      channelId: computed(() => store.state.app.currentChannelId)
    })

    return {
      state
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
