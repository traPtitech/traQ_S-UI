<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import { onMounted, ref } from 'vue'

const { tracksMap, addScreenShareTrack, addCameraTrack } = useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()

const backgroundImage = ref<File>()
</script>

<template>
  <div :class="$style.Block">
    <h1 :class="$style.Header">Qall View</h1>
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
      @change="
        e => {
          const target = e.target as HTMLInputElement
          backgroundImage = target?.files?.[0]
        }
      "
      type="file"
    />
    <button
      @click="[
        addCameraTrack(selectedVideoInput, false, backgroundImage),
        console.log(selectedVideoInput)
      ]"
    >
      Add Camera Track
    </button>
    <div :class="$style.TrackContainer">
      <template
        v-for="track of tracksMap.values()"
        :key="track.trackPublication?.trackSid"
      >
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
  overflow: scroll;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
}
</style>
