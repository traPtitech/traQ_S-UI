<template>
  <div :class="$style.container">
    <qall-details-panel-user
      v-if="me"
      :class="$style.slider"
      :key="me"
      :user-id="me"
      :mic-muted="mutedUsers.includes(me)"
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
      :mic-muted="mutedUsers.includes(id)"
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
    const me = computed(() => store.state.domain.me.detail?.id)
    const users = computed(() =>
      store.getters.app.rtc.currentSessionUsers.filter(id => id !== me.value)
    )
    const mutedUsers = computed(() => store.getters.app.rtc.currentMutedUsers)
    return { users, me, mutedUsers, showVolumeTune, toggleVolumeTune }
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
