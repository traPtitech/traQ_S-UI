<script lang="ts" setup>
import { computed } from 'vue'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import AudioComponent from './AudioComponent.vue'
import { useQall } from '/@/composables/qall/useQall'

const { tracksMap } = useQall()

const firstVideoTrack = computed(
  () =>
    tracksMap.value &&
    Array.from(tracksMap.value.entries()).find(
      ([_sid, track]) => track.trackPublication?.kind === 'video'
    )
)
</script>
<template>
  <VideoComponent
    v-if="firstVideoTrack"
    :key="firstVideoTrack[0]"
    :track-info="firstVideoTrack[1]"
    :is-large="false"
  />
  <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
    <AudioComponent
      v-if="track.trackPublication?.kind === 'audio'"
      :track-info="track"
      :is-large="false"
      :is-show="false"
    />
  </template>
</template>
