<template>
  <div :class="$style.container">
    <div :class="$style.icon" @click="togglePlay">
      <icon mdi :name="isPlaying ? 'pause' : 'play'" :size="20" />
    </div>
    <chrome-audio-time
      :class="$style.time"
      :display-current-time="displayCurrentTime"
      :display-duration="displayDuration"
    />
    <chrome-audio-slider
      :class="$style.sliderContainer"
      @changeVolume="changeVolume"
      @changeTime="changeTime"
      :current-time="currentTime"
      :duration="duration"
      :volume="volume"
    />
    <div :class="$style.icon" @click="startPictureInPicture">
      <icon
        mdi
        name="picture-in-picture-bottom-right"
        :class="$style.PInPButton"
        :size="20"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useFileMeta from '@/use/fileMeta'
import useAudio from './use/useAudio'
import Icon from '@/components/UI/Icon.vue'
import ChromeAudioTime from './ChromeAudioTime.vue'
import ChromeAudioSlider from './ChromeAudioSlider.vue'
import store from '@/store'

export default defineComponent({
  name: 'ChromeAudio',
  components: {
    Icon,
    ChromeAudioTime,
    ChromeAudioSlider
  },
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const { fileMeta, fileRawPath } = useFileMeta(props, context)
    const {
      isPlaying,
      currentTime,
      displayCurrentTime,
      duration,
      displayDuration,
      volume,
      togglePlay,
      changeVolume,
      changeTime,
      startPinP
    } = useAudio(fileMeta, fileRawPath)
    const startPictureInPicture = async () => {
      const iconId =
        store.state.entities.users[fileMeta.value?.uploaderId ?? '']
          ?.iconFileId ?? ''
      await startPinP(iconId)
    }
    return {
      isPlaying,
      currentTime,
      displayCurrentTime,
      duration,
      displayDuration,
      volume,
      togglePlay,
      changeVolume,
      changeTime,
      startPictureInPicture
    }
  }
})
</script>

<style lang="scss" module>
.container {
  color: black;
  background-color: rgb(241, 243, 244);
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
  cursor: pointer;
  &:hover {
    background: rgba(32, 33, 36, 0.06);
  }
}
.sliderContainer {
  margin: 0 4px;
  flex: 1;
}
</style>
