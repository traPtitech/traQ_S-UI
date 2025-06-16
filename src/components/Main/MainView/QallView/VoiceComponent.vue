<script setup lang="ts">
import { computed } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUsersStore } from '/@/store/entities/users'
import { buildUserIconPath } from '/@/lib/apis'
import AudioTrack from './AudioTrack.vue'
import { useUserVolume } from '/@/store/app/userVolume'
const { trackInfo, isShow } = defineProps<{
  trackInfo: TrackInfo
  isShow?: boolean
}>()
const { getStore, setStore, restoringPromise } = useUserVolume()
const volume = computed<number | string>(
  () => getStore(trackInfo.username) ?? 1
)

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(trackInfo.username))
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
  <AudioTrack :track-info="trackInfo" :volume="parseToFloat(volume)" />
</template>
<style lang="scss" module></style>
