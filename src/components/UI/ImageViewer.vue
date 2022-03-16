<template>
  <div ref="containerEle" :class="$style.container">
    <div :class="$style.imgContainer" :style="styles.imgContainer">
      <img
        :src="src"
        :class="$style.img"
        :style="styles.img"
        draggable="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import useImageViewer from './composables/useImageViewer'

defineProps<{
  src?: string
}>()

const containerEle = ref<HTMLDivElement>()

const { styles } = useImageViewer(containerEle)
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
}
.imgContainer {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  user-select: none;
}
.img {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  max-height: 100%;
  max-width: 100%;
  margin: auto;
}
</style>
