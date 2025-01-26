<script setup lang="ts">
import { computed } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
import { useUserVolume } from '/@/store/app/userVolume'
import UserCard from './UserCard.vue'
const { trackInfo, isShow } = defineProps<{
  trackInfo: TrackInfo
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
  <div :class="isShow ? $style.container : []">
    <UserCard :track-info="trackInfo" />
    <AudioTrack :track-info="trackInfo" :volume="parseToFloat(volume)" />
  </div>
</template>
<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
