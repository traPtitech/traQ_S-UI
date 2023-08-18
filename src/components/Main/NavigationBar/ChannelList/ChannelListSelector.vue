<template>
  <div :class="$style.container">
    <a-tab
      label="すべて"
      :aria-selected="!isStared"
      @click="unselectStarFilter"
    />
    <a-tab
      label="お気に入り"
      :aria-selected="isStared"
      @click="selectStarFilter"
    />
  </div>
</template>

<script lang="ts" setup>
import ATab from '/@/components/UI/ATab.vue'

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
</style>
