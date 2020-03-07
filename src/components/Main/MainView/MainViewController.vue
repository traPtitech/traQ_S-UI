<template>
  <MessagesView :channelId="state.channelId" />
</template>

<script lang="ts">
import { createComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { LayoutType, ViewInformation } from '@/store/ui/mainView/state'
import { VNode } from 'vue'

import MessagesView from '@/components/Main/MainView/MessagesView.vue'
import QallView from '@/components/Main/MainView/QallView.vue'

export default createComponent({
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
