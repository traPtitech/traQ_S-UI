<template>
  <div :class="$style.container">
    <qall-details-panel-user
      v-if="me"
      :class="$style.slider"
      :key="me"
      :user-id="me"
      :mic-muted="me in mutedUsersMap"
      :show-tune-button="!showVolumeTune"
      :show-tune-done-button="showVolumeTune"
      @tune="toggleVolumeTune(true)"
      @tune-done="toggleVolumeTune(false)"
      disabled
    />
    <qall-details-panel-user
      v-for="id in users"
      :class="$style.slider"
      :key="id"
      :user-id="id"
      :mic-muted="id in mutedUsersMap"
      :show-volume-control="showVolumeTune"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'

export default defineComponent({
  name: 'QallDetailsPanel',
  components: {
    QallDetailsPanelUser
  },
  setup() {
    const showVolumeTune = ref(false)
    const toggleVolumeTune = (show: boolean) => {
      showVolumeTune.value = show
    }
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
          state?.sessionStates.some(
            s =>
              s.sessionId === currentSession.value?.sessionId &&
              s.states.includes('micmuted')
          )
        )
      )
    )
    return { users, me, mutedUsersMap, showVolumeTune, toggleVolumeTune }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 12px;
  max-height: 120px;
  overflow: scroll;
}
.slider {
  margin: 12px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
