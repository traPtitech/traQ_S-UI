<template>
  <div :class="$style.container">
    <qall-details-panel-user-volume-slider
      v-if="me"
      :class="$style.slider"
      :key="me"
      :user-id="me"
      :mic-muted="me in mutedUsersMap"
      disabled
    />
    <qall-details-panel-user-volume-slider
      v-for="id in users"
      :class="$style.slider"
      :key="id"
      :user-id="id"
      :mic-muted="id in mutedUsersMap"
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
    const currentSession = computed(() => store.getters.app.rtc.qallSession)
    const me = computed(() => store.state.domain.me.detail?.id)
    const users = computed(() => {
      if (!currentSession.value) {
        return []
      }
      return (
        store.state.app.rtc.sessionUsersMap[
          currentSession.value.sessionId
        ]?.filter(id => id !== me.value) ?? []
      )
    })
    const mutedUsersMap = computed(() =>
      Object.fromEntries(
        Object.entries(store.state.app.rtc.userStateMap).filter(([_, state]) =>
          state?.sessionStates.find(
            s =>
              s.sessionId === currentSession.value?.sessionId &&
              s.states.includes('micmuted')
          )
        )
      )
    )
    return { users, me, mutedUsersMap }
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
