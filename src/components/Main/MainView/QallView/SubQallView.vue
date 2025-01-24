<script lang="ts" setup>
import { computed } from 'vue'
import AudioTrack from './AudioTrack.vue'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
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
  />
  <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
    <audio-track
      v-if="track.trackPublication?.kind === 'audio'"
      :track-info="track"
      :volume="1"
    />
  </template>
</template>
