<template>
  <div :class="$style.container">
    <qall-details-panel-user-volume-slider
      v-if="me"
      :class="$style.slider"
      :key="me"
      :user-id="me"
      disabled
    />
    <qall-details-panel-user-volume-slider
      v-for="id in users"
      :class="$style.slider"
      :key="id"
      :user-id="id"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'
import QallDetailsPanelUserVolumeSlider from './QallDetailsPanelUserVolumeSlider.vue'

export default defineComponent({
  name: 'QallDetailsPanel',
  components: {
    QallDetailsPanelUserVolumeSlider
  },
  setup() {
    const me = computed(() => store.state.domain.me.detail?.id)
    const users = computed(() => {
      const currentSession = store.getters.app.rtc.qallSession
      if (!currentSession) {
        return []
      }
      return (
        store.state.app.rtc.sessionUsersMap[currentSession.sessionId]?.filter(
          id => id !== me.value
        ) ?? []
      )
    })
    return { users, me }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px;
}
.slider {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
