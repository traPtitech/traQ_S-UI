<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()
const volume = ref(1)
const { findUserByName } = useUsersStore()
const user = computed(() => findUserByName(trackInfo.participantIdentity))
const userIconFileId = computed(() => user.value?.iconFileId ?? '')
const iconImage = computed(() => buildUserIconPath(userIconFileId.value))
</script>

<template>
  <div>
    <div :class="$style.UserCard">
      <AudioTrack :track-info="trackInfo" :volume="volume" />

      <div :class="$style.OuterIcon"><img :src="iconImage" /></div>
      <div :class="$style.InnerIcon"><img :src="iconImage" /></div>

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
