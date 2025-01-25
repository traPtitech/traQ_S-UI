<script setup lang="ts">
import { ref } from 'vue'
import SoundBoardElement from './SoundBoardElement.vue'
import FormInput from '/@/components/UI/FormInput.vue'

const searchQuery = ref('')
</script>

<template>
  <div :class="$style.soundBoard">
    <div><FormInput v-model="searchQuery" placeholder="検索" /></div>
    <div :class="$style.elementContainer">
      <SoundBoardElement v-for="i in 15" :key="i" />
    </div>
  </div>
</template>

<style lang="scss" module>
.soundBoard {
  position: absolute;
  margin: 0.5rem;
  padding: 0.5rem;
  bottom: 48px;
  left: 0;
  height: 30rem;
  overflow-y: scroll;
  border-radius: 0.5rem;
  @include background-primary;
  overflow: scroll;
}
.elementContainer {
  width: 30.5rem;
  max-width: 100%;

  margin: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.25rem;
}
</style>
