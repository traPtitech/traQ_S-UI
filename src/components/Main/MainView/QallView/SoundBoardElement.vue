<script setup lang="ts">
import { ref } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'

const stampId = ref('69c10725-2176-45ac-a4a5-22e70b8a76f7')
const soundName = ref(
  '草草草草草草草草草草草草草草草草草草草草草草草草草草草草草草草草'
)
</script>

<template>
  <div :class="$style.soundBoardContainer">
    <div>
      <AStamp :stamp-id="stampId" :size="32" />
    </div>
    <div>{{ soundName }}</div>
  </div>
</template>

<style lang="scss" module>
.soundBoardContainer {
  padding: 0.5rem;
  border-radius: 0.5rem;
  gap: 0.5rem;
  display: flex;
  align-items: center;
  &:hover {
    background-color: rgba(0, 100, 255, 1);
    @include background-tertiary;
  }
  width: 15rem;
  min-height: 4rem;
  user-select: none;
  @include color-ui-primary;
}
</style>
