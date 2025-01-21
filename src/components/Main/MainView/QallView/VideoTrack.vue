<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo, participantIdentity } = defineProps<{
  trackInfo: TrackInfo
  participantIdentity: string
}>()

const { removeVideoTrack } = useQall()

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')
const volume = ref(1)
watchEffect(() => {
  if (videoElement.value) {
    videoElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (videoElement.value) {
    trackInfo.trackPublication?.track?.attach(videoElement.value)
  }
})

onUnmounted(() => {
  trackInfo.trackPublication?.track?.detach()
})
</script>

<template>
  <div :id="'camera-' + participantIdentity">
    <div :class="$style.UserCard">
    <video
      v-if="trackInfo.trackPublication"
      :id="trackInfo.trackPublication.trackSid"
      ref="videoElement"
      :class="$style.video"
      
    ></video>
    <div :class="$style.NameLabel">{{ participantIdentity }}</div>
    </div>
    <input v-model="volume" type="range" min="0" max="1" step="0.01" />
    <button
      v-if="!trackInfo.isRemote && trackInfo.trackPublication"
      @click="removeVideoTrack(trackInfo.trackPublication)"
    >
      Remove Screen Share
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
