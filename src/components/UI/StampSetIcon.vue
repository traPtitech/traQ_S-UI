<template>
  <AStamp
    v-if="stampSet.type === 'palette'"
    :stamp-id="stampPalettesMap.get(stampSet.id)?.stamps?.[0] ?? ''"
    :size="size"
  />
  <AIcon
    v-else-if="stampSet.type === 'category'"
    :name="`stampCategory/${stampSet.id}`"
    :size="size"
  />
  <AIcon
    v-else
    mdi
    :name="stampSet.type === 'recommendation' ? 'creation' : 'history'"
    :size="size"
  />
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import type { StampSet } from '/@/store/ui/stampPickerSettings'

withDefaults(
  defineProps<{
    stampSet: StampSet
    size?: number
  }>(),
  { size: 24 }
)

const { stampPalettesMap } = useStampPalettesStore()
</script>
