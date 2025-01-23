<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import VideoTrack from './VideoTrack.vue'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()

const { removeVideoTrack } = useQall()
</script>

<template>
  <div :id="'camera-' + trackInfo.participantIdentity">
    <div :class="$style.UserCard">
      <VideoTrack :track-info="trackInfo" :class="$style.video" />
      <div :class="$style.NameLabel">{{ trackInfo.participantIdentity }}</div>
    </div>
    <button
      v-if="!trackInfo.isRemote && trackInfo.trackPublication"
      @click="removeVideoTrack(trackInfo.trackPublication)"
    >
      Remove Video
    </button>
  </div>
</template>

<style lang="scss" module>
.video {
  width: 100%;
  height: 100%;
}
.NameLabel {
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: flex;
  padding: 4px 12px;
  align-items: flex-start;
  gap: 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}
.UserCard {
  height: 108px;
  width: 192px;
  // border: 1px solid black;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
</style>
