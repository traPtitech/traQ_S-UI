<template>
  <collapse-content>
    <!-- TODO: Qall -->
    <!-- hasIdの部分など -->
    <qall-details-panel-user
      v-if="myId"
      :key="myId"
      :class="$style.slider"
      :user-id="myId"
      :mic-muted="hasId"
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
      :mic-muted="hasId"
      :show-volume-control="isVolumeTuneShown"
    />
  </collapse-content>
</template>

<script lang="ts" setup>
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'
import CollapseContent from '../CollapseContent.vue'
import { computed } from 'vue'
import { useMeStore } from '/@/store/domain/me'
import useToggle from '/@/composables/utils/useToggle'

const { myId } = useMeStore()


const hasId = computed(() => false)

const {
  value: isVolumeTuneShown,
  open: showVolumeTune,
  close: hideVolumeTune
} = useToggle()

// TODO: Qall

const users = []
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
