<script setup lang="ts">
import { ref } from 'vue'
import SoundBoardElement from './SoundBoardElement.vue'
import FormInput from '/@/components/UI/FormInput.vue'

const searchQuery = ref('')
</script>

<template>
  <div :class="$style.soundBoard">
    <FormInput v-model="searchQuery" placeholder="検索" />
    <SoundBoardElement v-for="i in 10" :key="i" />
  </div>
</template>

<style lang="scss" module>
.soundBoard {
  position: absolute;
  margin: 0.5rem;
  padding: 0.5rem;
  bottom: 0;
  left: 0;
  max-height: 60%;
  overflow-y: scroll;
  border-radius: 0.5rem;
  @include background-primary;
}
</style>
