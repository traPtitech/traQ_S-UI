<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VoiceComponent from './VoiceComponent.vue'

const { tracksMap, screenShareTrackSidMap, screenShareTracks } = useQall()
</script>
<template>
  <template v-for="[sid, track] in Array.from(tracksMap.entries())" :key="sid">
    <VoiceComponent
      v-if="
        track.trackPublication?.kind === 'audio' &&
        track.isRemote &&
        !screenShareTracks?.some?.(([_, valueSid]) => valueSid === sid)
      "
      :track-info="track"
    />
  </template>
</template>
