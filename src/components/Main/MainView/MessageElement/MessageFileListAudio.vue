<template>
  <router-link :to="fileLink" :class="$style.container">
    <div :class="$style.header">
      <audio-player-play-button
        v-model:is-playing="isPlaying"
        :class="$style.icon"
        :size="32"
        :disabled="cantPlay"
      />
      <div :class="$style.title">{{ name }}</div>
      <div :class="$style.headerTools">
        <audio-player-time
          :class="$style.time"
          :current-time="currentTime"
          :duration="duration"
        />
        <audio-player-volume-slider
          v-model:volume="volume"
          :class="$style.volumeSlider"
          :disabled="cantPlay"
          keep-expanded
        />
        <audio-player-loop-button
          v-model:loop="loop"
          :class="$style.icon"
          :size="20"
          :disabled="cantPlay"
        />
        <audio-player-pin-p-button
          :class="$style.icon"
          :is-pin-p-shown="isPinPShown"
          :size="20"
          :disabled="cantPlay"
          @click.prevent="startPictureInPicture"
        />
      </div>
    </div>
    <audio-player-waveform
      v-if="fileWaveformPath"
      v-model:current-time="currentTime"
      :class="$style.waveform"
      :waveform-path="fileWaveformPath"
      :duration="duration"
    />
    <audio-player-time-slider
      v-else
      v-model:current-time="currentTime"
      :class="$style.timeSlider"
      :duration="duration"
    />
    <div v-if="!canShow" :class="$style.error">表示できない音楽です</div>
    <div v-else-if="wasUnsupportedType" :class="$style.error">
      対応していないファイル形式でした
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import AudioPlayerPlayButton from '/@/components/UI/AudioPlayer/AudioPlayerPlayButton.vue'
import AudioPlayerTimeSlider from '/@/components/UI/AudioPlayer/AudioPlayerTimeSlider.vue'
import AudioPlayerTime from '/@/components/UI/AudioPlayer/AudioPlayerTime.vue'
import AudioPlayerVolumeSlider from '/@/components/UI/AudioPlayer/AudioPlayerVolumeSlider.vue'
import AudioPlayerLoopButton from '/@/components/UI/AudioPlayer/AudioPlayerLoopButton.vue'
import AudioPlayerPinPButton from '/@/components/UI/AudioPlayer/AudioPlayerPinPButton.vue'
import AudioPlayerWaveform from '/@/components/UI/AudioPlayer/AudioPlayerWaveform.vue'
import useFileWaveform from '/@/composables/files/useFileWaveform'
import useFileMeta from '/@/composables/files/useFileMeta'
import useAudio from '/@/composables/media/useAudio'
import { useUsersStore } from '/@/store/entities/users'
import type { ChannelId, DMChannelId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId | DMChannelId
    fileId?: string
  }>(),
  {
    fileId: ''
  }
)

const { usersMap } = useUsersStore()
const { fileLink, name, fileWaveformPath } = useFileWaveform(props)
const { fileMeta, fileRawPath, canShow } = useFileMeta(props)
const {
  cantPlay,
  wasUnsupportedType,
  isPlaying,
  currentTime,
  duration,
  volume,
  loop,
  isPinPShown,
  startPinP
} = useAudio(fileMeta, fileRawPath)
const startPictureInPicture = () => {
  const iconId =
    usersMap.value.get(fileMeta.value?.uploaderId ?? '')?.iconFileId ?? ''
  startPinP(iconId)
}
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: block;
  max-width: min(600px, 100%);
  border: {
    width: 2px;
    style: solid;
    radius: 6px;
    color: $theme-ui-secondary-default;
  }
}
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 4px;
}
.title {
  flex: 1 0 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.headerTools {
  display: flex;
  align-items: center;
  flex: 1;
}
.time {
  margin: 0 4px;
}
.waveform {
  height: 60px;
  width: 100%;
}
.timeSlider {
  padding: 8px 20px;
}
.volumeSlider {
  padding: 4px;
  margin-left: auto;
}
.icon {
  padding: 4px;
  margin: 2px 4px;
}
.error {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: contrast(0.5) brightness(1.3);
}
</style>
