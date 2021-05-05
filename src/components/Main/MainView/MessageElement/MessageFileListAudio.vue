<template>
  <router-link :to="fileLink" :class="$style.container">
    <div :class="$style.header">
      <audio-player-play-button
        v-model:isPlaying="isPlaying"
        :class="$style.icon"
        :size="32"
      />
      <div>{{ name }}</div>
      <div :class="$style.headerSpacer"></div>
      <audio-player-time :current-time="currentTime" :duration="duration" />
      <audio-player-volume-slider
        v-model:volume="volume"
        :class="$style.volumeSlider"
        :duration="duration"
      />
      <audio-player-pin-p-button
        :class="$style.icon"
        :is-pin-p-shown="isPinPShown"
        :size="20"
        @click.prevent="startPictureInPicture"
      />
    </div>
    <audio-player-waveform
      v-if="fileWaveformPath"
      v-model:current-time="currentTime"
      :waveform-path="fileWaveformPath"
      :duration="duration"
    />
    <audio-player-time-slider
      v-else
      v-model:current-time="currentTime"
      :class="$style.timeSlider"
      :duration="duration"
    />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileWaveform from '@/use/fileWaveform'
import useFileMeta from '@/use/fileMeta'
import useAudio from '@/components/UI/use/audio'
import AudioPlayerPlayButton from '@/components/UI/AudioPlayer/AudioPlayerPlayButton.vue'
import AudioPlayerTimeSlider from '@/components/UI/AudioPlayer/AudioPlayerTimeSlider.vue'
import AudioPlayerTime from '@/components/UI/AudioPlayer/AudioPlayerTime.vue'
import AudioPlayerVolumeSlider from '@/components/UI/AudioPlayer/AudioPlayerVolumeSlider.vue'
import AudioPlayerPinPButton from '@/components/UI/AudioPlayer/AudioPlayerPinPButton.vue'
import AudioPlayerWaveform from '@/components/UI/AudioPlayer/AudioPlayerWaveform.vue'
import store from '@/store'

export default defineComponent({
  name: 'MessageFileListAudio',
  components: {
    AudioPlayerPlayButton,
    AudioPlayerTimeSlider,
    AudioPlayerTime,
    AudioPlayerVolumeSlider,
    AudioPlayerPinPButton,
    AudioPlayerWaveform
  },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { fileLink, name, fileWaveformPath } = useFileWaveform(props)
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
      fileLink,
      name,
      fileWaveformPath,

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
.container {
  display: block;
  border: {
    width: 2px;
    style: solid;
    radius: 6px;
    color: $theme-ui-secondary;
  }
}
.header {
  display: flex;
  align-items: center;
  padding: 0 4px;
}
.headerSpacer {
  flex: 1;
}
.timeSlider {
  padding: 8px 20px;
}
.volumeSlider {
  padding: 4px;
}
.icon {
  padding: 4px;
}
</style>
