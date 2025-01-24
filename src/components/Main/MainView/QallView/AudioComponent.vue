<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
import { useUserVolume } from '/@/store/app/userVolume'
const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()
const { getStore, setStore, restoringPromise } = useUserVolume()
const volume = ref<number | string>(getStore(trackInfo.username) ?? 1)

const { findUserByName } = useUsersStore()
const user = computed(() => findUserByName(trackInfo.username))
const userIconFileId = computed(() => user.value?.iconFileId ?? '')
const iconImage = computed(() => buildUserIconPath(userIconFileId.value))

const parseToFloat = (value: number | string): number => {
  if (typeof value === 'number') {
    return value
  }
  return parseFloat(value)
}

watch(
  () => volume.value,
  v => {
    setStore(trackInfo.username, parseToFloat(v))
  },
  { deep: true, immediate: true }
)

watch(
  () => getStore(trackInfo.username),
  v => {
    if (v) {
      volume.value = v
    }
  },
  { deep: true }
)
</script>

<template>
  <div>
    <div :class="$style.UserCard">
      <AudioTrack :track-info="trackInfo" :volume="parseToFloat(volume)" />

      <div :class="$style.OuterIcon"><img :src="iconImage" /></div>
      <div :class="$style.InnerIcon"><img :src="iconImage" /></div>

      <div :class="$style.NameLabel">{{ trackInfo.username }}</div>
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
