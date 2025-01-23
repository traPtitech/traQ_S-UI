<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  reactive,
  useTemplateRef,
  watchEffect,
  computed
} from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()
const audioElement = useTemplateRef<HTMLMediaElement>('audioElement')
const volume = ref(1)
const { findUserByName } = useUsersStore()
watchEffect(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (audioElement.value) {
    trackInfo.trackPublication?.track?.attach(audioElement.value)
  }
})

onUnmounted(() => {
  trackInfo.trackPublication?.track?.detach()
})
const user = computed(() => findUserByName(trackInfo.participantIdentity))
const userIconFileId = computed(() => user.value?.iconFileId ?? '')
const iconStyle = reactive({
  container: computed(() => ({
    backgroundImage: userIconFileId.value
      ? `url(${buildUserIconPath(userIconFileId.value)})`
      : undefined
  }))
})
</script>

<template>
  <div :class="$style.UserCard">
    <audio
      :id="trackInfo.trackPublication?.trackSid"
      ref="audioElement"
    ></audio>

    <div :style="iconStyle.container" :class="$style.OuterIcon" />
    <div :style="iconStyle.container" :class="$style.InnerIcon" />

    <div :class="$style.NameLabel">{{ trackInfo.participantIdentity }}</div>
  </div>
  <input v-model="volume" type="range" min="0" max="1" step="0.01" />
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
