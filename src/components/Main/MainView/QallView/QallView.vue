<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import UserList from '/@/components/Main/MainView/QallView/UserList.vue'
import { onMounted, ref } from 'vue'

const { tracksMap, addScreenShareTrack, addCameraTrack } = useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()
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
    <button
      @click="[
        addCameraTrack(selectedVideoInput),
        console.log(selectedVideoInput)
      ]"
    >
      Add Camera Track
    </button>
    <UserList />
  </div>
</template>

<style lang="scss" module>
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
