<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import { onMounted, ref } from 'vue'
import ScreenShareComponent from './ScreenShareComponent.vue'
import UserCard from './UserCard.vue'

const { tracksMap, screenShareTrackSidMap, screenShareTracks, selectedTrack } =
  useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()
const selectedSid = ref<string>()
const showAllTracks = ref(false)
</script>

<template>
  <div
    v-if="selectedTrack !== undefined"
    :key="selectedTrack.trackPublication?.trackSid"
    :class="$style.largeCard"
  >
    <VideoComponent
      v-if="
        selectedTrack.trackPublication?.kind === 'video' &&
        !screenShareTrackSidMap.has(selectedSid ?? '')
      "
      :track-info="selectedTrack"
    />
    <ScreenShareComponent
      v-else-if="selectedTrack.trackPublication?.kind === 'video'"
      :track-info="selectedTrack"
      :audio-track-info="
        tracksMap.get(screenShareTrackSidMap.get(selectedSid ?? '') ?? '')
      "
      not-mute
    />
    <UserCard
      v-else-if="
        selectedTrack.trackPublication?.kind === 'audio' &&
        !screenShareTrackSidMap
          .values()
          ?.some?.(valueSid => valueSid === selectedSid)
      "
      :track-info="selectedTrack"
    />
    <div :class="$style.TrackContainer">
      <template v-for="([sid, track], index) in tracksMap.entries()" :key="sid">
        <div
          v-if="index < 5"
          :class="$style.card"
          @click="[selectedTrack, selectedSid] = [track, sid]"
        >
          <VideoComponent
            v-if="
              track.trackPublication?.kind === 'video' &&
              !screenShareTrackSidMap.has(sid)
            "
            :track-info="track"
          />
          <ScreenShareComponent
            v-else-if="track.trackPublication?.kind === 'video'"
            :track-info="track"
            :audio-track-info="
              tracksMap.get(screenShareTrackSidMap.get(sid) ?? '')
            "
          />
          <UserCard
            v-else-if="
              track.trackPublication?.kind === 'audio' &&
              !screenShareTracks.some?.(([_, valueSid]) => valueSid === sid)
            "
            :track-info="track"
          />
        </div>
      </template>
      <div v-if="tracksMap.size > 5" :class="$style.card">
        <button @click="showAllTracks = true">+{{ tracksMap.size - 5 }}</button>
      </div>
    </div>
  </div>

  <div v-else :class="$style.gridContainer">
    <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
      <div
        v-if="
          track.trackPublication?.kind === 'video' &&
          !screenShareTrackSidMap.has(sid)
        "
        :class="$style.smallCard"
        @click="[selectedTrack, selectedSid] = [track, sid]"
      >
        <VideoComponent :track-info="track" />
      </div>
      <div
        v-else-if="track.trackPublication?.kind === 'video'"
        :class="$style.smallCard"
        @click="[selectedTrack, selectedSid] = [track, sid]"
      >
        <ScreenShareComponent
          :track-info="track"
          :audio-track-info="
            tracksMap.get(screenShareTrackSidMap.get(sid) ?? '')
          "
        />
      </div>
      <div
        v-else-if="
          track.trackPublication?.kind === 'audio' &&
          !screenShareTracks.some?.(([_, valueSid]) => valueSid === sid)
        "
        :class="$style.smallCard"
        @click="[selectedTrack, selectedSid] = [track, sid]"
      >
        <UserCard :track-info="track" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" module>
.largeCard {
  height: 69%;
  width: 92%;
  position: absolute;
  bottom: calc(300px + 24px);
  left: 50%;
  transform: translateX(-50%);
}

.gridContainer {
  display: grid;
  grid-template-columns: repeat(5, 192px);
  grid-auto-rows: 108px;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  margin: 0 auto;
}

.smallCard {
  height: 108px;
  width: 192px;
}

.TrackContainer {
  position: absolute;
  bottom: calc(100px + 24px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
}

.card {
  height: 108px;
  width: 192px;
}
</style>
