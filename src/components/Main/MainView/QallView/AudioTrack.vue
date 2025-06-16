<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watchEffect } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useRtcSettings } from '/@/store/app/rtcSettings'
const { trackInfo, volume } = defineProps<{
  trackInfo: TrackInfo
  volume: number
}>()
const audioElement = useTemplateRef<HTMLMediaElement>('audioElement')
const audioContext = new AudioContext()
const gainNode = audioContext.createGain()
const { masterVolume } = useRtcSettings()
gainNode.gain.value = volume * masterVolume.value

watchEffect(() => {
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(volume * masterVolume.value, 1e-44),
    audioContext.currentTime + 0.2
  )
})

onMounted(() => {
  if (audioElement.value) {
    // chromeだと一回要素に入れないと上手く再生してくれない
    trackInfo.trackPublication?.track?.attach(audioElement.value)
    if (trackInfo.trackPublication?.track?.mediaStream) {
      audioContext
        .createMediaStreamSource(trackInfo.trackPublication?.track?.mediaStream)
        .connect(gainNode)
        .connect(audioContext.destination)
      audioElement.value.muted = true
    }
  }
})

onUnmounted(() => {
  audioContext.close()
  if (audioElement.value) {
    trackInfo.trackPublication?.track?.detach(audioElement.value)
  }
})
</script>

<template>
  <audio :id="trackInfo.trackPublication?.trackSid" ref="audioElement" />
</template>
<style lang="scss" module>
.UserCard {
  height: 108px;
  width: 192px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.InnerIcon {
  height: 96px;
  width: 96px;
  background-size: cover;
  border-radius: 50%;
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.OuterIcon {
  height: 250px;
  width: 250px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
  overflow: hidden;
  filter: blur(40px);
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
</style>
