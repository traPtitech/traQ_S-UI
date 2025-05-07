<script setup lang="ts">
import { ref } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import AudioTrack from './AudioTrack.vue'
import VideoComponent from './VideoComponent.vue'

const { trackInfo, audioTrackInfo } = defineProps<{
  trackInfo: TrackInfo
  audioTrackInfo: TrackInfo | undefined
  notMute?: boolean
}>()

const volume = ref(1)
</script>

<template>
  <div :class="$style.container">
    <VideoComponent v-if="trackInfo.trackPublication" :track-info="trackInfo" />
    <AudioTrack
      v-if="notMute && trackInfo.isRemote && audioTrackInfo?.trackPublication"
      :track-info="audioTrackInfo"
      :volume="volume"
    />
    <input
      v-model="volume"
      type="range"
      min="0"
      max="2"
      step="0.01"
      :class="$style.volume"
    />
  </div>
</template>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  position: relative;
}
.volume {
  position: absolute;
  bottom: 0;
  right: 4px;
  width: 4rem;
}
</style>
