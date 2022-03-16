<template>
  <online-indicator :user-id="userId" :title="tooltip" />
</template>

<script lang="ts" setup>
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'
import { computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { getFullDayWithTimeString } from '/@/lib/basic/date'

const props = defineProps<{
  userId: UserId
  lastOnline?: string
}>()

const tooltip = computed(() =>
  props.lastOnline
    ? `Last Online: ${getFullDayWithTimeString(new Date(props.lastOnline))}`
    : undefined
)
</script>
