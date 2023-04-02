<template>
  <div :class="$style.container">
    <div :class="$style.buttonContainer">
      <button
        :class="$style.button"
        :aria-selected="!isStared"
        @click="unselectStarFilter"
      >
        すべて
      </button>
    </div>
    <div :class="$style.buttonContainer">
      <button
        :class="$style.button"
        :aria-selected="isStared"
        @click="selectStarFilter"
      >
        お気に入り
      </button>
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
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.buttonContainer {
  position: relative;
  text-align: center;
}

.button {
  padding: 0.25rem 1rem;
  height: 2rem;
  cursor: pointer;
  @include color-ui-secondary;

  &[aria-selected='true'] {
    @include color-accent-primary;
  }
  &::after {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -1;
    opacity: 0;
    border-radius: 100vw;
  }
  &[aria-selected='true']::after {
    opacity: 0.1;
    @include background-accent-primary;
  }
  &[aria-selected='false']:hover::after {
    opacity: 1;
    @include background-tertiary;
  }
}
</style>
