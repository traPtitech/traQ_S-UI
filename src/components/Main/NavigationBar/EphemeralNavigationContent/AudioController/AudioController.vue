<template>
  <div>
    <audio-controller-detail-panel />
    <audio-controller-title-panel />
  </div>
</template>

<script lang="ts" setup>
import AudioControllerTitlePanel from './AudioControllerTitlePanel.vue';
import AudioControllerDetailPanel from './AudioControllerDetailPanel.vue';


</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}
.control {
  flex: 0 1 64px;
}
</style>
