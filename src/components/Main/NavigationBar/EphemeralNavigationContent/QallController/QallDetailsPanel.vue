<template>
  <collapse-content>
    <qall-details-panel-user
      v-if="myId"
      :key="myId"
      :class="$style.slider"
      :user-id="myId"
      :mic-muted="mutedUsers.has(myId)"
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

<script lang="ts" setup>
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'
import CollapseContent from '../CollapseContent.vue'
import { computed, ref } from 'vue'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'

const { myId } = useMeStore()
const { currentSessionUsers, currentMutedUsers: mutedUsers } =
  useDomainRtcStore()

const showVolumeTune = ref(false)
const toggleVolumeTune = (show: boolean) => {
  showVolumeTune.value = show
}

const users = computed(() =>
  [...currentSessionUsers.value].filter(id => id !== myId.value)
)
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
