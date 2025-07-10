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
      :aria-selected="!isStared"
      :aria-controls="allPanelId"
      :tabindex="isStared ? -1 : 0"
      @click="unselectStarFilter"
    />
    <a-tab
      ref="staredTabRef"
      label="お気に入り"
      :aria-selected="isStared"
      :aria-controls="staredPanelId"
      :tabindex="isStared ? 0 : -1"
      @click="selectStarFilter"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import ATab from '/@/components/UI/ATab.vue'

const isStared = defineModel<boolean>('isStared', {
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
  const index = isStared.value ? 1 : 0

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
  isStared.value = tabNames[nextIndex] === 'stared'
  tabNameRefs[nextTabName].value?.focus()
}

const selectStarFilter = () => {
  isStared.value = true
}
const unselectStarFilter = () => {
  isStared.value = false
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
