<template>
  <collapse-content>
    <qall-details-panel-user
      v-if="me"
      :key="me"
      :class="$style.slider"
      :user-id="me"
      :mic-muted="mutedUsers.has(me)"
      :show-tune-button="!showVolumeTune"
      :show-tune-done-button="showVolumeTune"
      disabled
      @tune="toggleVolumeTune(true)"
      @tune-done="toggleVolumeTune(false)"
    />
    <qall-details-panel-user
      v-for="id in users"
      :key="id"
      :class="$style.slider"
      :user-id="id"
      :mic-muted="mutedUsers.has(id)"
      :show-volume-control="showVolumeTune"
    />
  </collapse-content>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import store from '/@/vuex'
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'
import CollapseContent from '../CollapseContent.vue'
import { useDomainRtcStore } from '/@/store/domain/rtc'

export default defineComponent({
  name: 'QallDetailsPanel',
  components: {
    CollapseContent,
    QallDetailsPanelUser
  },
  setup() {
    const { currentSessionUsers, currentMutedUsers: mutedUsers } =
      useDomainRtcStore()

    const showVolumeTune = ref(false)
    const toggleVolumeTune = (show: boolean) => {
      showVolumeTune.value = show
    }

    const me = computed(() => store.state.domain.me.detail?.id)
    const users = computed(() =>
      [...currentSessionUsers.value].filter(id => id !== me.value)
    )

    return {
      users,
      me,
      mutedUsers,
      showVolumeTune,
      toggleVolumeTune
    }
  }
})
</script>

<style lang="scss" module>
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
