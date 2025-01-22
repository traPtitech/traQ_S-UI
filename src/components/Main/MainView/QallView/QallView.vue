<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import CallControlButton from './CallControlButton.vue'
import CallControlButtonSmall from './CallControlButtonSmall.vue'

const {
  tracksMap,
  toggleCalling,
  addScreenShareTrack,
  addCameraTrack,
  removeVideoTrack
} = useQall()

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

const toggleAudio = async () => {
  try {
    for (const trackInfo of tracksMap.value.values()) {
      if (
        !trackInfo.isRemote &&
        trackInfo.trackPublication?.kind === 'audio' &&
        trackInfo.trackPublication.track
      ) {
        if (isMicOn.value) {
          await trackInfo.trackPublication.track.mute()
        } else {
          await trackInfo.trackPublication.track.unmute()
        }
        isMicOn.value = !isMicOn.value
        micIcon.value = isMicOn.value
          ? '/@/assets/icons/mic.svg?url'
          : '/@/assets/icons/mic_off.svg?url'
        break
      }
    }
  } catch (err) {
    console.error('Failed to toggle audio:', err)
  }
}

const toggleVideo = async () => {
  try {
    if (!isCameraOn.value) {
      await addCameraTrack(selectedVideoInput.value)
      isCameraOn.value = true
    } else {
      for (const trackInfo of tracksMap.value.values()) {
        if (
          !trackInfo.isRemote &&
          trackInfo.trackPublication?.kind === 'video' &&
          !trackInfo.trackPublication.trackName?.includes('screen')
        ) {
          await removeVideoTrack(trackInfo.trackPublication)
          break
        }
      }
      isCameraOn.value = false
    }
    cameraIcon.value = isCameraOn.value
      ? '/@/assets/icons/videocam.svg?url'
      : '/@/assets/icons/videocam_off.svg?url'
  } catch (err) {
    console.error('Failed to toggle video:', err)
  }
}

const toggleScreen = async () => {
  try {
    if (!isScreenSharing.value) {
      await addScreenShareTrack()
      isScreenSharing.value = true
    } else {
      for (const trackInfo of tracksMap.value.values()) {
        if (
          !trackInfo.isRemote &&
          trackInfo.trackPublication?.kind === 'video' &&
          trackInfo.trackPublication.trackName?.includes('screen')
        ) {
          await removeVideoTrack(trackInfo.trackPublication)
          break
        }
      }
      isScreenSharing.value = false
    }
    screenShareIcon.value = isScreenSharing.value
      ? '/@/assets/icons/stop_screen_share.svg?url'
      : '/@/assets/icons/screen_share.svg?url'
  } catch (err) {
    console.error('Failed to toggle screen sharing:', err)
  }
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

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()

const backgroundImage = ref<File>()

const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')
</script>

<template>
  <div :class="$style.Block">
    <h1 :class="$style.Header">Qall View</h1>
    {{ backgroundType }}
    <button @click="addScreenShareTrack">Add Screen Share Track</button>
    <select v-model="selectedVideoInput">
      <option
        v-for="videoInput in videoInputs"
        :key="videoInput.deviceId"
        :value="videoInput"
      >
        {{ videoInput.label }}
      </option>
    </select>

    <input
      id="original"
      v-model="backgroundType"
      type="radio"
      value="original"
    />
    <label for="original">original</label>
    <input id="blur" v-model="backgroundType" type="radio" value="blur" />
    <label for="blur">blur</label>
    <input id="file" v-model="backgroundType" type="radio" value="file" />
    <label for="file">file</label>
    <input id="screen" v-model="backgroundType" type="radio" value="screen" />
    <label for="screen">screen</label>

    <input type="file" @change="handleFileChange" />
    <button @click="handleAddCameraTrack">Add Camera Track</button>

    <div :class="$style.TrackContainer">
      <template v-for="(track, index) in tracksMap.values()" :key="index">
        <VideoComponent
          v-if="track.trackPublication?.kind === 'video'"
          :track-info="track"
          :participant-identity="track.participantIdentity"
          :class="$style.video"
        />
        <AudioComponent
          v-else-if="track.trackPublication?.kind === 'audio' && track.isRemote"
          :track-info="track"
        />
      </template>
      <div :class="$style.controlBar">
        <div :class="$style.smallButtonGroup">
          <CallControlButtonSmall
            icon="/@/assets/icons/sound_detection_loud_sound.svg?url"
            :on-click="handleSound"
          />
          <CallControlButtonSmall
            icon="/@/assets/icons/add_reaction.svg?url"
            :on-click="handleReaction"
          />
        </div>

        <div :class="$style.verticalBar"></div>
        <CallControlButton
          :icon="screenShareIcon"
          :on-click="toggleScreen"
          :is-on="isScreenSharing"
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
          <CallControlButtonSmall
            icon="/@/assets/icons/group_qall.svg?url"
            :on-click="handleGroup"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
.TrackContainer {
  height: fit-content;
}
.video {
  width: 50%;
  height: 50%;
}
.Block {
  color: green;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #222325;
  overflow: scroll;
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
