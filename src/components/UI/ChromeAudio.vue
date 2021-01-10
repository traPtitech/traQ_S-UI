<template>
  <div v-if="!cantPlay" :class="$style.container">
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
      @change-volume="changeVolume"
      @change-time="changeTime"
      :current-time="currentTime"
      :duration="duration"
      :volume="volume"
    />
    <div
      v-if="canUsePinP"
      :class="$style.icon"
      :aria-disabled="isPinPShown"
      @click="startPictureInPicture"
    >
      <icon mdi name="picture-in-picture-bottom-right" :size="20" />
    </div>
    <div v-if="wasUnsupportedType" :class="$style.unsupportedError">
      対応していないファイル形式でした
    </div>
  </div>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import useAudio from './use/audio'
import Icon from '@/components/UI/Icon.vue'
import ChromeAudioTime from './ChromeAudioTime.vue'
import ChromeAudioSlider from './ChromeAudioSlider.vue'
import store from '@/store'
import { checkPinPSupport, isSafari } from '@/lib/util/browser'

const safariFlag = isSafari()
const canUsePinP = checkPinPSupport() && !safariFlag

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
      cantPlay,
      wasUnsupportedType,
      isPlaying,
      currentTime,
      displayCurrentTime,
      duration,
      displayDuration,
      volume,
      togglePlay,
      changeVolume,
      changeTime,
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
      displayCurrentTime,
      duration,
      displayDuration,
      volume,
      togglePlay,
      changeVolume,
      changeTime,
      canUsePinP,
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
  cursor: pointer;
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
