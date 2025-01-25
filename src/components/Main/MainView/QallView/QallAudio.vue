<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import AudioComponent from './AudioComponent.vue'

const { tracksMap, screenShareTrackSidMap } = useQall()
</script>
<template>
  <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
    <AudioComponent
      v-if="
        track.trackPublication?.kind === 'audio' &&
        track.isRemote &&
        !screenShareTrackSidMap.values()?.some?.(valueSid => valueSid === sid)
      "
      :track-info="track"
      :is-large="false"
      :is-show="false"
    />
  </template>
</template>
