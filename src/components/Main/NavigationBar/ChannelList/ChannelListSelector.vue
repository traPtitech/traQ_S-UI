<template>
  <div :class="$style.container">
    <div :class="$style.buttonContainer" :aria-selected="!isStared">
      <button :class="$style.button" @click="unselectStarFilter">すべて</button>
      <div :class="$style.buttonBG"></div>
    </div>
    <div :class="$style.buttonContainer" :aria-selected="isStared">
      <button :class="$style.button" @click="selectStarFilter">
        お気に入り
      </button>
      <div :class="$style.buttonBG"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  isStared: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isStared', v: boolean): void
}>()

const selectStarFilter = () => {
  emit('update:isStared', true)
}
const unselectStarFilter = () => {
  emit('update:isStared', false)
}
</script>

<style lang="scss" module>
.container {
  align-items: center;
}

.buttonContainer {
  position: relative;
  // width: calc(50% - 2rem);
  display: inline-block;
}

.button {
  //position: absolute;
  padding: 0 1rem;
  height: 1.5rem;
  .buttonContainer[aria-selected='true'] > & {
    @include color-accent-primary;
  }
}

.buttonBG {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: -1;
  opacity: 0.1;
  border-radius: 100vw;
  .buttonContainer[aria-selected='true'] > & {
    @include background-accent-primary;
  }
}
</style>
