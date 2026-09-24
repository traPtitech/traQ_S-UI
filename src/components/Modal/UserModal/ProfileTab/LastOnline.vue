<template>
  <section>
    <ProfileHeader text="最終オンライン日時" />
    <p>{{ lastOnlineString }}</p>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { getFullDayWithTimeString } from '/@/lib/basic/date'

import ProfileHeader from './ProfileHeader.vue'

const props = defineProps<{
  isOnline?: boolean
  lastOnline?: string
}>()

const lastOnlineString = computed(() => {
  if (props.isOnline) return 'オンライン中'
  return props.lastOnline
    ? getFullDayWithTimeString(new Date(props.lastOnline))
    : ''
})
</script>
