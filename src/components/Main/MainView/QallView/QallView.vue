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
import { useModalStore } from '/@/store/ui/modal'
import CameraDetailSetting from './CameraDetailSetting.vue'
import ScreenShareDetailSetting from './ScreenShareDetailSetting.vue'
import DetailButton from './DetailButton.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import QallMessageView from './QallMessageView.vue'

const { pushModal } = useModalStore()

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
      trackInfo.username === participant.user.name &&
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
</script>

<template>
  <div :class="$style.Block">
    <QallMessageView :channel-id="callingChannel" :typing-users="[]">
      <DanmakuContainer />
      <IconButton
        icon-name="close"
        icon-mdi
        :class="$style.closeButton"
        @click="isSubView = true"
      />
      <UserList />

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
              @add="
                () => {
                  isScreenSharing = true
                }
              "
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
              @add="
                () => {
                  isCameraOn = true
                }
              "
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
    </QallMessageView>
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

.controlBarContainer {
  position: absolute;
  bottom: 24px; // 仮置き，メッセージの表示非表示に動的対応
  left: 50%;
  transform: translateX(-50%);
}

.channelView {
  position: absolute;
  width: 30%;
  right: 0;
  bottom: 0;
}

.Block {
  height: 100%;
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

.soundBoardButton {
  position: relative;
}

.closeButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
