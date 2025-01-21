<script setup lang="ts">
import { ref } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import CallControlButton from './CallControlButton.vue'
import CallControlButoonSmall from './CallControlButoonSmall.vue'

const { tracksMap, toggleCalling } = useQall()

const isMicOn = ref(true)
const isCameraOn = ref(false)
const isScreenSharing = ref(false)

const micIcon = ref(
  isMicOn.value
    ? '/@/assets/icons/mic.svg?url'
    : '/@/assets/icons/mic_off.svg?url'
)
const cameraIcon = ref(
  isCameraOn.value
    ? '/@/assets/icons/videocam.svg?url'
    : '/@/assets/icons/videocam_off.svg?url'
)
const screenShareIcon = ref(
  isScreenSharing.value
    ? '/@/assets/icons/stop_screen_share.svg?url'
    : '/@/assets/icons/screen_share.svg?url'
)

const endCall = () => {
  toggleCalling('')
}
const toggleAudio = () => {
  isMicOn.value = !isMicOn.value
  micIcon.value = isMicOn.value
    ? '/@/assets/icons/mic.svg?url'
    : '/@/assets/icons/mic_off.svg?url'
}
const toggleVideo = () => {
  isCameraOn.value = !isCameraOn.value
  cameraIcon.value = isCameraOn.value
    ? '/@/assets/icons/videocam.svg?url'
    : '/@/assets/icons/videocam_off.svg?url'
}
const toggleScreen = () => {
  isScreenSharing.value = !isScreenSharing.value
  screenShareIcon.value = isScreenSharing.value
    ? '/@/assets/icons/screen_share.svg?url'
    : '/@/assets/icons/stop_screen_share.svg?url'
}
const handleSound = () => {
  // TODO
  console.log('sound')
}
const handleReaction = () => {
  // TODO
  console.log('reaction')
}
const handleGroup = () => {
  // TODO
  console.log('group')
}
</script>

<template>
  <div :class="$style.Block">
    <div>
      <div
        v-for="track of tracksMap.values()"
        :key="track.trackPublication?.trackSid"
      >
        <VideoComponent
          v-if="track.trackPublication?.kind === 'video'"
          :track="track.trackPublication.videoTrack!"
          :participant-identity="track.participantIdentity"
        />
        <AudioComponent
          v-else-if="track.trackPublication?.kind === 'audio'"
          :track="track.trackPublication.audioTrack!"
        />
        <div :class="$style.controlBar">
          <div :class="$style.smallButtonGroup">
            <CallControlButoonSmall
              icon="/@/assets/icons/sound_detection_loud_sound.svg?url"
              :on-click="handleSound"
            />
            <CallControlButoonSmall
              icon="/@/assets/icons/add_reaction.svg?url"
              :on-click="handleReaction"
            />
          </div>

          <div :class="$style.verticalBar"></div>
          <CallControlButton
            :icon="screenShareIcon"
            :on-click="toggleScreen"
            :is-on="!isScreenSharing"
          />
          <CallControlButton
            :icon="cameraIcon"
            :on-click="toggleVideo"
            :is-on="isCameraOn"
          />
          <CallControlButton
            :icon="micIcon"
            :on-click="toggleAudio"
            :is-on="isMicOn"
          />
          <CallControlButton
            icon="/@/assets/icons/call_end.svg?url"
            :on-click="endCall"
            :is-on="false"
          />
          <div :class="$style.verticalBar"></div>
          <div :class="$style.smallButtonGroup">
            <CallControlButoonSmall
              icon="/@/assets/icons/group_qall.svg?url"
              :on-click="handleGroup"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
.Block {
  color: green;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #222325;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
  text-align: center;
}

.controlBar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.verticalBar {
  width: 1px;
  height: 64px;
  background-color: #ced6db;
  margin: 0 16px;
}

.smallButtonGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
