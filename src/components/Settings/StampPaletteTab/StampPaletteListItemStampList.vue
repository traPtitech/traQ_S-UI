<template>
  <div :class="$style.stamps">
    <div v-for="stampId in stampsToShow" :key="stampId">
      <a-stamp :stamp-id="stampId" />
    </div>
    <div v-if="needsToggle">
      <icon-button
        v-if="isExpanded"
        icon-name="chevron-left"
        icon-mdi
        title="たたむ"
        :class="$style.toggleButton"
        @click="toggleExpand"
      />
      <button
        v-else
        title="さらに表示"
        :class="$style.toggleButton"
        @click="toggleExpand"
      >
        +{{ stamps.length - STAMP_THRESHOLD }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import type { StampId } from '/@/types/entity-ids'

const { stamps } = defineProps<{
  stamps: StampId[]
}>()

const isExpanded = ref(false)
const STAMP_THRESHOLD = 10

const needsToggle = computed(() => stamps.length > STAMP_THRESHOLD)

const stampsToShow = computed(() => {
  if (!needsToggle.value || isExpanded.value) {
    return stamps
  }
  return stamps.slice(0, STAMP_THRESHOLD)
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" module>
.stamps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.toggleButton {
  @include color-ui-secondary;
  cursor: pointer;
}
</style>
