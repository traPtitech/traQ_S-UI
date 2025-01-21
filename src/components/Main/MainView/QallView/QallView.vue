<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import { onMounted, ref } from 'vue'
import DanmakuContainer from './DanmakuContainer.vue'

const { tracksMap, addScreenShareTrack, addCameraTrack } = useQall()

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
  position: relative;
  height: 80%;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
}
</style>
