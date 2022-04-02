<template>
  <div :class="$style.container"></div>
</template>

<script lang="ts" setup>
import type { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'

const props = defineProps<{
  stampId: StampId
}>()

const { stampsMap } = useStampsStore()
const fileId = stampsMap.value.get(props.stampId)?.fileId ?? ''
const imageUrl = fileId ? `${buildFilePath(fileId)}` : ''
</script>

<style lang="scss" module>
.container {
  padding: 8px;
}
</style>
