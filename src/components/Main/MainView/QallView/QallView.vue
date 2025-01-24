<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import UserList from '/@/components/Main/MainView/QallView/UserList.vue'
import { onMounted, ref } from 'vue'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import DanmakuContainer from './DanmakuContainer.vue'
import CallControlButtonSmall from './CallControlButtonSmall.vue'
import CallControlButton from './CallControlButton.vue'
import ScreenShareComponent from './ScreenShareComponent.vue'
import { LocalTrackPublication } from 'livekit-client'
import QallMessageView from './QallMessageView.vue'

const {
  tracksMap,
  screenShareTrackSidMap,
  callingChannel,
  leaveQall,
  addScreenShareTrack,
  addCameraTrack,
  removeVideoTrack
} = useQall()

const isMicOn = ref(true)
const isCameraOn = ref(false)
const isScreenSharing = ref(false)

const micIcon = ref(isMicOn.value ? 'microphone' : 'microphone-off')
const cameraIcon = ref(isCameraOn.value ? 'vide' : 'video-off')
const screenShareIcon = ref(
  isScreenSharing.value ? 'stop-screen-share' : 'screen-share'
)

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
        micIcon.value = isMicOn.value ? 'microphone' : 'microphone-off'
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
          trackInfo.trackPublication instanceof LocalTrackPublication &&
          trackInfo.trackPublication?.kind === 'video' &&
          !trackInfo.trackPublication.trackName?.includes('screen')
        ) {
          await removeVideoTrack(trackInfo.trackPublication)
          break
        }
      }
      isCameraOn.value = false
    }
    cameraIcon.value = isCameraOn.value ? 'video' : 'video-off'
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
          trackInfo.trackPublication instanceof LocalTrackPublication &&
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
      ? 'stop-screen-share'
      : 'screen-share'
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
    <DanmakuContainer />
    <QallMessageView
      :channel-id="callingChannel"
      :typing-users="[]"
      :class="$style.channelView"
    />
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

    <input
      type="file"
      @change="
        e => {
          const target = e.target as HTMLInputElement
          backgroundImage = target?.files?.[0]
        }
      "
    />
    <button
      @click="[
        addCameraTrack(selectedVideoInput, backgroundType, backgroundImage),
        console.log(selectedVideoInput)
      ]"
    >
      Add Camera Track
    </button>
    <UserList />

    <div :class="$style.TrackContainer">
      <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
        <VideoComponent
          v-if="
            track.trackPublication?.kind === 'video' &&
            !screenShareTrackSidMap.has(sid)
          "
          :track-info="track"
          :class="$style.video"
        />
        <ScreenShareComponent
          v-else-if="track.trackPublication?.kind === 'video'"
          :track-info="track"
          :audio-track-info="
            tracksMap.get(screenShareTrackSidMap.get(sid) ?? '')
          "
          :participant-identity="track.participantIdentity"
          :class="$style.video"
        />
        <AudioComponent
          v-else-if="
            track.trackPublication?.kind === 'audio' &&
            track.isRemote &&
            !screenShareTrackSidMap
              .values()
              ?.some?.(valueSid => valueSid === sid)
          "
          :track-info="track"
        />
      </template>
      <div :class="$style.controlBar">
        <div :class="$style.smallButtonGroup">
          <CallControlButtonSmall
            icon="sound_detection_loud_sound"
            :on-click="handleSound"
          />
          <CallControlButtonSmall
            icon="add_reaction"
            :on-click="handleReaction"
          />
        </div>

        <div :class="$style.verticalBar"></div>
        <CallControlButton
          :icon="screenShareIcon"
          :is-on="isScreenSharing"
          :on-click="toggleScreen"
          :mdi="false"
        />
        <CallControlButton
          :icon="cameraIcon"
          :is-on="isCameraOn"
          :on-click="toggleVideo"
          :inverted="isCameraOn"
        />
        <CallControlButton
          :icon="micIcon"
          :is-on="isMicOn"
          :on-click="toggleAudio"
          :inverted="isMicOn"
        />
        <CallControlButton
          icon="phone-hangup"
          is-on
          :on-click="leaveQall"
          :on-background-color="'#F26451'"
        />
        <div :class="$style.verticalBar"></div>
        <div :class="$style.smallButtonGroup">
          <CallControlButtonSmall
            icon="account-multiple"
            :on-click="handleGroup"
            mdi
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
.channelView {
  position: absolute;
  width: 30%;
  right: 0;
  bottom: 0;
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
  position: relative;
  height: 100%;
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
