<script setup lang="ts">
import { computed } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
import { useUserVolume } from '/@/store/app/userVolume'
const { trackInfo, isLarge, isShow } = defineProps<{
  trackInfo: TrackInfo
  isLarge: boolean
  isShow?: boolean
}>()
const { getStore, setStore, restoringPromise } = useUserVolume()
const volume = computed<number | string>(
  () => getStore(trackInfo.username) ?? 1
)

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
</script>

<template>
  <template v-if="isShow">
    <div>
      <div :class="isLarge ? $style.LargeCard : $style.UserCard">
        <AudioTrack :track-info="trackInfo" :volume="parseToFloat(volume)" />

        <div :class="$style.OuterIcon">
          <img :src="iconImage" :class="$style.OuterImage" />
        </div>
        <div :class="isLarge ? $style.LargeInnerIcon : $style.InnerIcon">
          <img :src="iconImage" :class="$style.InnerImage" />
        </div>

        <div :class="$style.NameLabel">{{ trackInfo.username }}</div>
      </div>
    </div>
  </template>
  <template v-else>
    <AudioTrack :track-info="trackInfo" :volume="parseToFloat(volume)" />
  </template>
</template>
<style lang="scss" module>
.UserCard {
  height: 108px;
  width: 192px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  pointer-events: none;
  user-select: none;
}
.LargeCard {
  height: 324px;
  width: 576px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  pointer-events: none;
  user-select: none;
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
