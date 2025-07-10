<template>
  <div
    :class="$style.container"
    role="tablist"
    @keydown.left="onKeydown"
    @keydown.right="onKeydown"
  >
    <a-tab
      ref="allTabRef"
      label="すべて"
      :aria-selected="!isStarred"
      :aria-controls="allPanelId"
      :tabindex="isStarred ? -1 : 0"
      @click="unselectStarFilter"
    />
    <a-tab
      ref="staredTabRef"
      label="お気に入り"
      :aria-selected="isStarred"
      :aria-controls="staredPanelId"
      :tabindex="isStarred ? 0 : -1"
      @click="selectStarFilter"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import ATab from '/@/components/UI/ATab.vue'

const isStarred = defineModel<boolean>('isStarred', {
  required: true
})

defineProps<{
  allPanelId: string
  staredPanelId: string
}>()

const allTabRef = ref<InstanceType<typeof ATab> | null>(null)
const staredTabRef = ref<InstanceType<typeof ATab> | null>(null)

const tabNames = ['all', 'stared'] as const
const tabNameRefs: Record<
  (typeof tabNames)[number],
  Ref<InstanceType<typeof ATab> | null>
> = {
  all: allTabRef,
  stared: staredTabRef
}

const onKeydown = (e: KeyboardEvent) => {
  const index = isStarred.value ? 1 : 0

  let nextIndex: number
  if (e.key === 'ArrowLeft') {
    nextIndex = index - 1
  } else if (e.key === 'ArrowRight') {
    nextIndex = index + 1
  } else {
    return
  }

  nextIndex = (nextIndex + tabNames.length) % tabNames.length

  const nextTabName = tabNames[nextIndex] ?? tabNames[index]
  isStarred.value = tabNames[nextIndex] === 'stared'
  tabNameRefs[nextTabName].value?.focus()
}

const selectStarFilter = () => {
  isStarred.value = true
}
const unselectStarFilter = () => {
  isStarred.value = false
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
