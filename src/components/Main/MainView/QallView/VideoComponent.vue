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
  <div :class="$style.UserCard">
    <!-- <button
      v-if="!trackInfo.isRemote && trackInfo.trackPublication"
      @click="removeVideoTrack(trackInfo.trackPublication)"
    >
      Remove Video
    </button> -->
    <VideoTrack :track-info="trackInfo" :class="$style.video" />
    <div :class="$style.NameLabel">{{ trackInfo.username }}</div>
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
  background-color: #000;
  position: relative;
  overflow: hidden;
  border-radius: 12px;

  width: 100%;
  height: 100%;
}
</style>
