<template>
  <div :class="$style.container">
    <audio-player-time :current-time="currentTime" :duration="duration" />
    <button @click="resetAudio">stop</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue'
import { useAudioController } from '@/providers/audioController'
import useAudio from '@/components/UI/use/audio'
import useFileMeta from '@/use/fileMeta'
import AudioPlayerTime from '@/components/UI/AudioPlayer/AudioPlayerTime.vue'

export default defineComponent({
  name: 'AudioControllerDetailPanel',
  components: {
    AudioPlayerTime
  },
  setup() {
    const { audio, fileId, resetAudio } = useAudioController()
    const { fileMeta, fileRawPath } = useFileMeta(
      reactive({ fileId: computed(() => fileId.value ?? '') })
    )
    const { currentTime, duration } = useAudio(fileMeta, fileRawPath, audio)
    return { currentTime, duration, resetAudio }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
