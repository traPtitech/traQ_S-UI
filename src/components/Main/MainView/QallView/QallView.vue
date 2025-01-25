<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import { onMounted, ref, computed } from 'vue'
import DanmakuContainer from './DanmakuContainer.vue'
import CallControlButtonSmall from './CallControlButtonSmall.vue'
import CallControlButton from './CallControlButton.vue'
import { LocalTrackPublication } from 'livekit-client'
import QallMessageView from './QallMessageView.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import AIcon from '/@/components/UI/AIcon.vue'

const {
  tracksMap,
  screenShareTrackSidMap,
  callingChannel,
  leaveQall,
  addScreenShareTrack,
  addCameraTrack,
  removeVideoTrack,
  rooms
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
const showParticipants = ref(false)

const currentRoomParticipants = computed(() => {
  return (
    rooms.value.find(
      (room: { channel: { id: string } }) =>
        room.channel.id === callingChannel.value
    )?.participants ?? []
  )
})

const handleGroup = () => {
  showParticipants.value = !showParticipants.value
}

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()

const backgroundImage = ref<File>()

const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')

const handleParticipantVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  console.log(target.value)
}

const handleParticipantMute = () => {
  // TODO: Qall 適切な処理
  console.log('participant mute')
}
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
    <div>
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
    </div>

    <div :class="$style.TrackContainer">
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
          :inverted="isScreenSharing"
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
          <div :class="$style.participantsContainer">
            <div v-show="showParticipants" :class="$style.participantsList">
              <div :class="$style.participantsContent">
                <div
                  v-for="participant in currentRoomParticipants"
                  :key="participant.user.id"
                  :class="$style.participantItem"
                >
                  <div :class="$style.leftSide">
                    <user-icon :size="40" :user-id="participant.user.id" />
                    <span :class="$style.userName">{{
                      participant.user.displayName
                    }}</span>
                    <button :class="$style.micIconButton">
                      <a-icon name="microphone-off" mdi />
                    </button>
                  </div>
                  <div :class="$style.rightSide">
                    <button
                      :class="$style.iconButton"
                      @click="handleParticipantMute"
                    >
                      <!-- TODO: Qall 適切な条件分岐 -->
                      <a-icon v-if="false" name="volume-high" :size="24" mdi />
                      <a-icon v-else name="volume-off" mdi :size="24" />
                    </button>
                    <input
                      :class="$style.volumeSlider"
                      type="range"
                      min="0"
                      max="100"
                      @input="handleParticipantVolume"
                    />
                    <button :class="$style.accountMinusButton">
                      <a-icon name="account-minus" :size="24" mdi />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <CallControlButtonSmall
              icon="account-multiple"
              :on-click="handleGroup"
              mdi
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
.participantsContainer {
  position: relative;
}

.participantsList {
  position: absolute;
  bottom: 100%;
  right: 50%;
  width: 450px;
  height: 300px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: translateX(50%);
}

.participantsContent {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.participantItem {
  padding: 8px;
  border-bottom: 1px solid rgba(206, 214, 219, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
}

.userIcon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
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

.leftSide {
  display: flex;
  align-items: center;
}

.userName {
  line-height: 24px;
  margin-left: 12px;
}

.micIconButton {
  margin-left: 4px;
  color: black;
  cursor: pointer;
}

.rightSide {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.iconButton {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.volumeSlider {
  width: 100px;
}

.accountMinusButton {
  cursor: pointer;
  color: #f26451;
}
</style>
