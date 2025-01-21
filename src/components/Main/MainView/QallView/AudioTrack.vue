<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'

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
const user = findUserByName(trackInfo.participantIdentity)
</script>

<template>
  <div :class="$style.UserCard">
    <audio
      :id="trackInfo.trackPublication?.trackSid"
      ref="audioElement"
    ></audio>

    <user-icon
      v-if="user !== null"
      :class="$style.OuterIcon"
      :size="250"
      :user-id="user.id"
    />
    <user-icon
      v-if="user !== null"
      :class="$style.InnerIcon"
      :size="96"
      :user-id="user.id"
    />

    <div :class="$style.NameLabel">{{ trackInfo.participantIdentity }}</div>
  </div>
  <input v-model="volume" type="range" min="0" max="1" step="0.01" />
</template>
<style lang="scss" module>
.UserCard {
  height: 108px;
  width: 192px;
  // border: 1px solid black;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.InnerIcon {
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.OuterIcon {
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
