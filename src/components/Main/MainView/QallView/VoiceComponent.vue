<script setup lang="ts">
import { computed } from 'vue'

import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useQallVolume } from '/@/composables/qall/useQallVolume'

import AudioTrack from './AudioTrack.vue'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()

const { getVolume } = useQallVolume()

const volume = computed(() => Number(getVolume(trackInfo)))
</script>

<template>
  <AudioTrack :track-info="trackInfo" :volume="volume" />
</template>
<style lang="scss" module></style>
