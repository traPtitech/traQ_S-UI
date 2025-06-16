<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import { onMounted, ref, useTemplateRef, computed } from 'vue'
import DanmakuContainer from './DanmakuContainer.vue'
import CallControlButtonSmall from './CallControlButtonSmall.vue'
import CallControlButton from './CallControlButton.vue'
import SoundBoard from './SoundBoard.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import ParticipantList from './ParticipantList.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import UserList from './UserList.vue'
import CameraDetailSetting from './CameraDetailSetting.vue'
import ScreenShareDetailSetting from './ScreenShareDetailSetting.vue'
import DetailButton from './DetailButton.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import QallMessageView from './QallMessageView.vue'
import { useUsersStore } from '/@/store/entities/users'

const {
  tracksMap,
  screenShareTracks,
  callingChannel,
  leaveQall,
  addScreenShareTrack,
  addCameraTrack,
  removeVideoTrack,
  publishData,
  toggleMicMute,
  qallMitt,
  rooms,
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isSubView
} = useQall()

const { usersMap } = useUsersStore()

const micIcon = computed(() =>
  isMicOn.value ? 'microphone' : 'microphone-off'
)
const cameraIcon = computed(() => (isCameraOn.value ? 'video' : 'video-off'))
const screenShareIcon = computed(() =>
  isScreenSharing.value ? 'stop-screen-share' : 'screen-share'
)

const toggleAudio = async () => {
  try {
    toggleMicMute()
    isMicOn.value = !isMicOn.value
  } catch (err) {}
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
          !trackInfo.trackPublication.source?.includes('screen')
        ) {
          await removeVideoTrack(trackInfo.trackPublication)
        }
      }
      isCameraOn.value = false
    }
  } catch (err) {
    // eslint-disable-next-line no-console
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
          trackInfo.trackPublication.source?.includes('screen')
        ) {
          await removeVideoTrack(trackInfo.trackPublication)
        }
      }
      isScreenSharing.value = false
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to toggle screen sharing:', err)
  }
}

const handleSound = () => {
  showSoundBoard.value = true
}

const reactionButton = useTemplateRef<HTMLDivElement>('reactionButton')
const { openStampPicker, closeStampPicker } = useStampPickerInvoker(
  async stampData => {
    try {
      await publishData({ type: 'stamp', message: stampData.id })
      qallMitt.emit('pushStamp', stampData.id)
      openStampPicker()
    } catch (e) {}
  },
  reactionButton,
  false,
  'bottom-left'
)
const handleReaction = () => {
  openStampPicker()
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

const showSoundBoard = ref(false)
const getParticipantTrackInfo = (participant: {
  user: { name: string }
}): TrackInfo | undefined => {
  for (const [, trackInfo] of tracksMap.value.entries()) {
    if (
      usersMap.value.get(trackInfo.username)?.name === participant.user.name &&
      trackInfo.trackPublication?.kind === 'audio' &&
      !screenShareTracks.value?.some?.(
        ([_, valueSid]) => valueSid === trackInfo.trackPublication?.trackSid
      )
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
}

const showCameraDetailSetting = ref(false)
const showShareScreenSettingDetail = ref(false)

const showDanmaku = ref(true)
const toggleDanmaku = () => {
  showDanmaku.value = !showDanmaku.value
}
</script>

<template>
  <div :class="$style.Block">
    <QallMessageView :channel-id="callingChannel" :typing-users="[]">
      <DanmakuContainer v-if="showDanmaku" />
      <div :class="$style.iconContainer">
        <IconButton
          :icon-name="`comment${showDanmaku ? '' : '-off'}-outline`"
          icon-mdi
          @click="toggleDanmaku"
        />
        <IconButton icon-name="close" icon-mdi @click="isSubView = true" />
      </div>
      <div :class="$style.stackContainer">
        <UserList :class="$style.userList" />
        <div :class="$style.controlBarContainer">
          <div :class="$style.controlBar">
            <div :class="$style.smallButtonGroup">
              <div :class="$style.soundBoardButton">
                <CallControlButtonSmall
                  icon="sound_detection_loud_sound"
                  :on-click="handleSound"
                />
                <ClickOutside @click-outside="showSoundBoard = false">
                  <SoundBoard v-if="showSoundBoard" />
                </ClickOutside>
              </div>
              <div ref="reactionButton">
                <CallControlButtonSmall
                  icon="add_reaction"
                  :on-click="handleReaction"
                />
              </div>
            </div>
            <div :class="$style.verticalBar" />
            <div :class="$style.buttonWithDetail">
              <CallControlButton
                :icon="screenShareIcon"
                :is-on="isScreenSharing"
                :on-click="toggleScreen"
                :mdi="false"
                :inverted="isScreenSharing"
              />
              <DetailButton @click="showShareScreenSettingDetail = true" />
              <ScreenShareDetailSetting
                :open="showShareScreenSettingDetail"
                @add="isScreenSharing = true"
                @close="showShareScreenSettingDetail = false"
              />
            </div>
            <div :class="$style.buttonWithDetail">
              <CallControlButton
                :icon="cameraIcon"
                :is-on="isCameraOn"
                :on-click="toggleVideo"
                :inverted="isCameraOn"
              />
              <DetailButton @click="showCameraDetailSetting = true" />
              <CameraDetailSetting
                :open="showCameraDetailSetting"
                :video-inputs="videoInputs"
                @save="handleBackgroundSave"
                @add="isCameraOn = true"
                @close="showCameraDetailSetting = false"
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
            <div :class="$style.verticalBar" />
            <div :class="$style.smallButtonGroup">
              <div :class="$style.participantsContainer">
                <ClickOutside @click-outside="showParticipants = false">
                  <div v-if="showParticipants" :class="$style.participantsList">
                    <div :class="$style.participantsContent">
                      <participant-list
                        v-for="participant in filteredParticipants"
                        :key="participant.user.id"
                        :participant="participant.user"
                        :track-info="getParticipantTrackInfo(participant)!"
                      />
                    </div>
                  </div>
                </ClickOutside>
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
    </QallMessageView>
  </div>
</template>

<style lang="scss" module>
.Block {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stackContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.userList {
  flex-grow: 1;
}

.controlBarContainer {
  width: 100%;
  display: flex;
  justify-content: end;
  flex-grow: 0;
  margin-bottom: 24px;
}

.controlBar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
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

.soundBoardButton {
  position: relative;
}

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

.verticalBar {
  width: 1px;
  height: 64px;
  background-color: $theme-ui-tertiary-default;
  margin: 0 16px;
}

.closeButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.iconContainer {
  display: flex;
  gap: 4px;
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
