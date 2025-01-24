<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import VideoTrack from './VideoTrack.vue'

const { trackInfo, isLarge } = defineProps<{
  trackInfo: TrackInfo
  isLarge: boolean
}>()

const { removeVideoTrack } = useQall()
</script>

<template>
  <div :id="'camera-' + trackInfo.username">
    <div :class="isLarge ? $style.LargeCard : $style.UserCard">
      <VideoTrack :track-info="trackInfo" :class="$style.video" />
      <div :class="$style.NameLabel">{{ trackInfo.username }}</div>
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
  background-color: #000;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.LargeCard {
  height: 324px;
  width: 576px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;

  background-color: #000;
}
</style>
