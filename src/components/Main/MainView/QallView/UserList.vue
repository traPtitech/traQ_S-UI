<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import ScreenShareComponent from './ScreenShareComponent.vue'
import UserCard from './UserCard.vue'
import UserSurplusCard from './UserSurplusCard.vue'

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

const largeCard = useTemplateRef<HTMLDivElement>('largeCard')
const largeCardParent = useTemplateRef<HTMLDivElement>('largeCardParent')

const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target
    keepAspectRatio(element)
  }
})

const keepAspectRatio = (element: Element) => {
  if (!(element instanceof HTMLDivElement)) return
  if (!largeCard.value) return
  const { height, width } = element.getBoundingClientRect()
  const originalRatio = height / width
  const targetRatio = 9 / 16

  let newWidth
  let newHeight

  if (originalRatio > targetRatio) {
    newWidth = width
    newHeight = (newWidth * 9) / 16
  } else {
    newHeight = height
    newWidth = (newHeight * 16) / 9
  }
  largeCard.value.style.width = `${newWidth}px`
  largeCard.value.style.height = `${newHeight}px`
}

watchEffect(() => {
  if (!largeCardParent.value) return
  resizeObserver.unobserve(largeCardParent.value)
  resizeObserver.observe(largeCardParent.value)
  keepAspectRatio(largeCardParent.value)
})

onUnmounted(() => {
  if (!largeCardParent.value) return
  resizeObserver.unobserve(largeCardParent.value)
})
</script>

<template>
  <div
    v-if="selectedTrack !== undefined"
    :key="selectedTrack.trackPublication?.trackSid"
    :class="$style.parentContainer"
  >
    <div :class="$style.flexContainer">
      <div ref="largeCardParent" :class="$style.largeCardParent">
        <div ref="largeCard" :class="$style.largeCard">
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
        </div>
      </div>

      <div :class="$style.subViewContainer">
        <template
          v-for="([sid, track], index) in tracksMap.entries()"
          :key="sid"
        >
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
          <UserSurplusCard
            :number="tracksMap.size - 5"
            @switch="
              () => {
                selectedTrack = undefined
              }
            "
          />
        </div>
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
.parentContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 100%;
  width: 100%;
}

.flexContainer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
}

.largeCardParent {
  flex-grow: 1;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.largeCard {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.subViewContainer {
  flex-grow: 0;
  height: 108px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
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

.card {
  height: 108px;
  width: 192px;
}
</style>
