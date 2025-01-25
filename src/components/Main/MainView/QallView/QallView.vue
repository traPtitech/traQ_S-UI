<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import { onMounted, ref, computed } from 'vue'
import DanmakuContainer from './DanmakuContainer.vue'
import CallControlButtonSmall from './CallControlButtonSmall.vue'
import CallControlButton from './CallControlButton.vue'
import { LocalTrackPublication } from 'livekit-client'
import QallMessageView from './QallMessageView.vue'
import ParticipantList from './ParticipantList.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import { useModalStore } from '/@/store/ui/modal'
import CameraDetailSetting from './CameraDetailSetting.vue'
import ScreenShareDetailSetting from './ScreenShareDetailSetting.vue'
import DetailButton from './DetailButton.vue'

const { pushModal } = useModalStore()

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
const cameraIcon = ref(isCameraOn.value ? 'video' : 'video-off')
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

const getParticipantTrackInfo = (participant: {
  user: { name: string }
}): TrackInfo | undefined => {
  for (const [, trackInfo] of tracksMap.value.entries()) {
    if (
      trackInfo.username === participant.user.name &&
      trackInfo.trackPublication?.kind === 'audio' &&
      !screenShareTrackSidMap.value
        .values()
        ?.some?.(valueSid => valueSid === trackInfo.trackPublication?.trackSid)
    ) {
      return trackInfo
    }
  }
  return undefined
}

const filteredParticipants = computed(() =>
  currentRoomParticipants.value.filter(
    participant => getParticipantTrackInfo(participant) !== undefined
  )
)

const handleBackgroundSave = (data: {
  backgroundType: 'original' | 'blur' | 'file' | 'screen'
  backgroundImage?: File
  selectedVideoInput?: MediaDeviceInfo
}) => {
  backgroundType.value = data.backgroundType
  backgroundImage.value = data.backgroundImage
  showCameraDetailSetting.value = false
  console.log(data.selectedVideoInput)
}

const showCameraDetailSetting = ref(false)
const showShareScreenSettingDetail = ref(false)
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
        <div :class="$style.buttonWithDetail">
          <CallControlButton
            :icon="screenShareIcon"
            :is-on="isScreenSharing"
            :on-click="toggleScreen"
            :mdi="false"
            :inverted="isScreenSharing"
          />
          <DetailButton
            @click="
              () => {
                showShareScreenSettingDetail = true
              }
            "
          />
          <ScreenShareDetailSetting
            :open="showShareScreenSettingDetail"
            @close="
              () => {
                showShareScreenSettingDetail = false
              }
            "
          />
        </div>
        <div :class="$style.buttonWithDetail">
          <CallControlButton
            :icon="cameraIcon"
            :is-on="isCameraOn"
            :on-click="toggleVideo"
            :inverted="isCameraOn"
          />
          <DetailButton
            :inverted="isCameraOn"
            @click="
              () => {
                showCameraDetailSetting = true
              }
            "
          />
          <CameraDetailSetting
            :open="showCameraDetailSetting"
            :video-inputs="videoInputs"
            @save="handleBackgroundSave"
            @close="
              () => {
                showCameraDetailSetting = false
              }
            "
          />
        </div>
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
                <participant-list
                  v-for="participant in filteredParticipants"
                  :key="participant.user.id"
                  :participant="participant.user"
                  :track-info="getParticipantTrackInfo(participant)!"
                />
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
  @include background-primary;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: translateX(50%);
  @include color-ui-primary;
}

.participantsContent {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  border: 2px solid $theme-background-secondary-default;
  border-radius: 8px;
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

.buttonWithDetail {
  position: relative;
  display: inline-block;
}
</style>
