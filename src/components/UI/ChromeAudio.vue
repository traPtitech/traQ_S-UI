<template>
  <div>
    <audio
      preload="none"
      :alt="fileMeta.name"
      :src="fileRawPath"
      ref="audioRef"
    />
    <div :class="$style.container">
      <div :class="$style.icon" @click="togglePlay">
        <icon mdi :name="isPlay ? 'pause' : 'play'" :size="20" />
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
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from '@vue/composition-api'
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
    const { fileMeta, fileLink, fileRawPath } = useFileMeta(props, context)
    const audioRef = shallowRef<HTMLAudioElement | null>(null)
    const {
      isPlay,
      currentTime,
      displayCurrentTime,
      duration,
      displayDuration,
      volume,
      togglePlay,
      changeVolume,
      changeTime,
      startPinP
    } = useAudio(audioRef)
    const startPictureInPicture = async () => {
      const iconId =
        store.state.entities.users[fileMeta.value?.uploaderId ?? '']
          ?.iconFileId ?? ''
      await startPinP(iconId)
    }
    return {
      fileMeta,
      fileLink,
      fileRawPath,
      audioRef,
      isPlay,
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
}
.icon {
  width: 48px;
  height: 56px;
  padding: 18px 14px;
  cursor: pointer;
}
.sliderContainer {
  flex: 1;
}
</style>
