<script setup lang="ts">
import { computed } from 'vue'

import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useUserVolume } from '/@/store/app/userVolume'

import AudioTrack from './AudioTrack.vue'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()

const { getStore } = useUserVolume()

const volume = computed<number | string>(
  () => getStore(trackInfo.username) ?? 1
)

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
