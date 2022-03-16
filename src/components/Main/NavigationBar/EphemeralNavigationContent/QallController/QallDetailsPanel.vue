<template>
  <collapse-content>
    <qall-details-panel-user
      v-if="myId"
      :key="myId"
      :class="$style.slider"
      :user-id="myId"
      :mic-muted="mutedUsers.has(myId)"
      :show-tune-button="!isVolumeTuneShown"
      :show-tune-done-button="isVolumeTuneShown"
      disabled
      @tune="showVolumeTune"
      @tune-done="hideVolumeTune"
    />
    <qall-details-panel-user
      v-for="id in users"
      :key="id"
      :class="$style.slider"
      :user-id="id"
      :mic-muted="mutedUsers.has(id)"
      :show-volume-control="isVolumeTuneShown"
    />
  </collapse-content>
</template>

<script lang="ts" setup>
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'
import CollapseContent from '../CollapseContent.vue'
import { computed } from 'vue'
import { useDomainRtcStore } from '/@/store/domain/rtc'
import { useMeStore } from '/@/store/domain/me'
import useToggle from '/@/composables/useToggle'

const { myId } = useMeStore()
const { currentSessionUsers, currentMutedUsers: mutedUsers } =
  useDomainRtcStore()

const {
  value: isVolumeTuneShown,
  open: showVolumeTune,
  close: hideVolumeTune
} = useToggle()

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
