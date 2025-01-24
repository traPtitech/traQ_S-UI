<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
const { trackInfo,isLarge } = defineProps<{
  trackInfo: TrackInfo
  isLarge: boolean
}>()
const volume = ref(1)
const { findUserByName } = useUsersStore()
const user = computed(() => findUserByName(trackInfo.participantIdentity))
const userIconFileId = computed(() => user.value?.iconFileId ?? '')
const iconImage = computed(() => buildUserIconPath(userIconFileId.value))
</script>

<template>
  <div>
    <div :class="isLarge ? $style.LargeCard : $style.UserCard">
      <AudioTrack :track-info="trackInfo" :volume="volume" />

      <div :class="$style.OuterIcon"><img :src="iconImage" :class="$style.OuterImage" /></div>
      <div :class="isLarge ? $style.LargeInnerIcon : $style.InnerIcon"><img :src="iconImage" :class="$style.InnerImage" /></div>

      <div :class="$style.NameLabel">{{ trackInfo.participantIdentity }}</div>
    </div>
    <input v-model="volume" type="range" min="0" max="3" step="0.01" />
  </div>
</template>
<style lang="scss" module>
.UserCard {
  height: 108px;
  width: 192px;
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
}
.InnerIcon {
  height: 64px;
  width: 64px;
  background-size: cover;
  border-radius: 50%;
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.LargeInnerIcon {
  height: 192px;
  width: 192px;
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
  height: 100%;
  width: 100%;
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
.OuterImage {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.InnerImage {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>
