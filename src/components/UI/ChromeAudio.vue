<template>
  <div v-if="!cantPlay" :class="$style.container">
    <audio-player-play-button
      v-model:isPlaying="isPlaying"
      :class="$style.icon"
      :size="20"
    />
    <audio-player-time
      :class="$style.time"
      :current-time="currentTime"
      :duration="duration"
    />
    <div :class="$style.sliderContainer">
      <audio-player-time-slider
        v-model:current-time="currentTime"
        :duration="duration"
      />
      <audio-player-volume-slider
        v-model:volume="volume"
        :class="$style.volumeSlider"
        :disabled="duration === 0"
      />
    </div>
    <audio-player-pin-p-button
      :class="$style.icon"
      :is-pin-p-shown="isPinPShown"
      :size="20"
      @click.prevent="startPictureInPicture"
    />
    <div v-if="wasUnsupportedType" :class="$style.unsupportedError">
      対応していないファイル形式でした
    </div>
  </div>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import useAudio from '@/use/audio'
import AudioPlayerPlayButton from './AudioPlayer/AudioPlayerPlayButton.vue'
import AudioPlayerTime from './AudioPlayer/AudioPlayerTime.vue'
import AudioPlayerTimeSlider from './AudioPlayer/AudioPlayerTimeSlider.vue'
import AudioPlayerVolumeSlider from './AudioPlayer/AudioPlayerVolumeSlider.vue'
import AudioPlayerPinPButton from './AudioPlayer/AudioPlayerPinPButton.vue'
import store from '@/store'

export default defineComponent({
  name: 'ChromeAudio',
  components: {
    AudioPlayerPlayButton,
    AudioPlayerTime,
    AudioPlayerTimeSlider,
    AudioPlayerVolumeSlider,
    AudioPlayerPinPButton
  },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { fileMeta, fileRawPath } = useFileMeta(props)
    const {
      cantPlay,
      wasUnsupportedType,
      isPlaying,
      currentTime,
      duration,
      volume,
      isPinPShown,
      startPinP
    } = useAudio(fileMeta, fileRawPath)
    const startPictureInPicture = async () => {
      const iconId =
        store.state.entities.usersMap.get(fileMeta.value?.uploaderId ?? '')
          ?.iconFileId ?? ''
      await startPinP(iconId)
    }

    return {
      cantPlay,
      wasUnsupportedType,
      isPlaying,
      currentTime,
      duration,
      volume,
      isPinPShown,
      startPictureInPicture
    }
  }
})
</script>

<style lang="scss" module>
$background-color: rgb(241, 243, 244);

.container {
  position: relative;
  color: black;
  background-color: $background-color;
  align-items: center;
  display: flex;
  flex: 0;
  padding: 4px;
}
.time {
  margin: 0 4px;
}
.icon {
  width: 28px;
  height: 28px;
  padding: 4px;
  margin: auto 4px;
  border-radius: 50%;
  &:not([aria-disabled='true']):hover {
    background: rgba(32, 33, 36, 0.06);
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
  }
}
.sliderContainer {
  margin: 0 4px;
  flex: 1;
}
.volumeSlider {
  padding: 4px;
}
.unsupportedError {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $background-color;
}
</style>
