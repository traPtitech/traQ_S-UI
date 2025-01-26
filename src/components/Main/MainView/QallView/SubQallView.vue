<script lang="ts" setup>
import { computed } from 'vue'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import { useQall } from '/@/composables/qall/useQall'
import { useRouter } from 'vue-router'
import { constructChannelPath } from '/@/router'
import useChannelPath from '/@/composables/useChannelPath'
import { Track } from 'livekit-client'
import UserCard from './UserCard.vue'
import ScreenShareComponent from './ScreenShareComponent.vue'

const {
  tracksMap,
  callingChannel,
  isSubView,
  selectedTrack,
  screenShareTrackSidMap
} = useQall()
const router = useRouter()
const { channelIdToPathString } = useChannelPath()

const track = computed(() =>
  selectedTrack.value
    ? [
        selectedTrack.value.trackPublication?.trackSid ?? '',
        selectedTrack.value
      ]
    : tracksMap.value && Array.from(tracksMap.value.entries())?.[0]
)

const restoreMainView = () => {
  const channelPath = channelIdToPathString(callingChannel.value)
  router.push(constructChannelPath(channelPath))
  isSubView.value = false
}
</script>
<template>
  <div :class="$style.container" @click="restoreMainView">
    <div
      v-if="
        track && typeof track[0] === 'string' && typeof track[1] === 'object'
      "
      :class="$style.subContainer"
    >
      <UserCard
        v-if="track[1].trackPublication?.kind === Track.Kind.Audio"
        :track-info="track[1]"
      />
      <ScreenShareComponent
        v-else-if="
          track[1].trackPublication?.kind === Track.Kind.Video &&
          screenShareTrackSidMap.has(track[0] ?? '')
        "
        :track-info="track[1]"
        :audio-track-info="
          tracksMap.get(screenShareTrackSidMap.get(track[0] ?? '') ?? '')
        "
      />
      <VideoComponent
        v-else-if="track[1].trackPublication?.kind === Track.Kind.Video"
        :track-info="track[1]"
      />
      <span v-else>Qallにもどる</span>
    </div>
    <div v-else>Qallにもどる</div>
  </div>
</template>

<style lang="scss" module>
.container {
  cursor: pointer;
  margin: 0.5rem;
  margin-bottom: 1rem;
}
.subContainer {
  width: 100%;
  aspect-ratio: 16 / 9;
}
</style>
