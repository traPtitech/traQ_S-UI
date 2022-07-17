<template>
  <div :class="$style.container">
    <file-modal-content-header v-if="fileMeta" :file-id="fileMeta.id" />
    <audio
      ref="audioEle"
      controls
      :src="fileRawPath"
      :class="$style.audio"
    />
    <audio-player-waveform
      v-if="fileWaveformPath"
      v-model:current-time="currentTime"
      :class="$style.waveform"
      :waveform-path="fileWaveformPath"
      :duration="duration"
    />
    <file-modal-content-footer v-if="fileMeta" :file-id="fileMeta.id" />
  </div>
</template>

<script lang="ts" setup>
import FileModalContentHeader from '/@/components/Modal/FileModal/FileModalContentHeader.vue'
import FileModalContentFooter from '/@/components/Modal/FileModal/FileModalContentFooter.vue'
import AudioPlayerWaveform from '/@/components/UI/AudioPlayer/AudioPlayerWaveform.vue'
import { shallowRef } from 'vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import useFileWaveform from '/@/composables/files/useFileWaveform'
import { useCurrentTime, useDuration } from '/@/composables/media/useAudio'

const props = defineProps<{
  fileId: string
}>()

const { fileMeta, fileRawPath } = useFileMeta(props)
const { fileWaveformPath } = useFileWaveform(props)

const audioEle = shallowRef<HTMLAudioElement>()
const currentTime = useCurrentTime(audioEle)
const duration = useDuration(audioEle)
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  position: relative;
  width: 100vw;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 12px 16px;
}
.audio {
  margin: 16px 0;
  width: calc(100% - 32px);
}
.waveform {
  height: 120px;
  width: calc(100% - 32px);
}
</style>
