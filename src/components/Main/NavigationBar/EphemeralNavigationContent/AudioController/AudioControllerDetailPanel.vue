<template>
  <div :class="$style.container">
    <div :class="$style.title">
      {{ name }}
    </div>
    <div :class="$style.sliderContainer">
      <audio-player-time-slider
        v-model:current-time="currentTime"
        :class="$style.timeSlider"
        :duration="duration"
        show-background-on-hover
      />
      <audio-player-time :current-time="currentTime" :duration="duration" />
    </div>
    <div :class="$style.controls">
      <audio-player-play-button
        v-model:is-playing="isPlaying"
        :size="20"
        :class="$style.icon"
      />
      <audio-player-stop-button
        :size="20"
        :class="$style.icon"
        @click="resetAudio"
      />
      <audio-player-loop-button
        v-model:loop="loop"
        :class="$style.icon"
        :size="20"
      />
      <audio-player-volume-slider
        v-model:volume="volume"
        :class="$style.volumeSlider"
        :disabled="duration === 0"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AudioPlayerPlayButton from '/@/components/UI/AudioPlayer/AudioPlayerPlayButton.vue'
import AudioPlayerStopButton from '/@/components/UI/AudioPlayer/AudioPlayerStopButton.vue'
import AudioPlayerLoopButton from '/@/components/UI/AudioPlayer/AudioPlayerLoopButton.vue'
import AudioPlayerTime from '/@/components/UI/AudioPlayer/AudioPlayerTime.vue'
import AudioPlayerTimeSlider from '/@/components/UI/AudioPlayer/AudioPlayerTimeSlider.vue'
import AudioPlayerVolumeSlider from '/@/components/UI/AudioPlayer/AudioPlayerVolumeSlider.vue'
import { computed, reactive } from 'vue'
import { useAudioController } from '/@/store/ui/audioController'
import useAudio from '/@/composables/media/useAudio'
import useFileMeta from '/@/composables/files/useFileMeta'

const { audio, fileId, resetAudio } = useAudioController()
const { fileMeta, fileRawPath } = useFileMeta(
  reactive({ fileId: computed(() => fileId.value ?? '') })
)
const name = computed(() => fileMeta.value?.name ?? '')
const { isPlaying, currentTime, duration, volume, loop } = useAudio(
  fileMeta,
  fileRawPath,
  audio
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  padding: 8px 12px;
}
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.controls {
  display: flex;
  align-items: center;
}
.icon {
  padding: 4px;
}
.sliderContainer {
  display: flex;
  align-items: center;
}
.timeSlider {
  flex: 1;
  padding: 4px 8px;
  margin: 4px 8px;
  margin-left: 0;
  border-radius: 12px;
}
.volumeSlider {
  flex-shrink: 1;
  min-width: 0;
  margin-left: auto;
  padding: 4px;
  border-radius: 16px;
}
</style>
