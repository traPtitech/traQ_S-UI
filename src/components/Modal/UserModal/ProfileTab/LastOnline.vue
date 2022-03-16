<template>
  <section>
    <profile-header text="最終オンライン日時" />
    <p>{{ lastOnlineString }}</p>
  </section>
</template>

<script lang="ts" setup>
import ProfileHeader from './ProfileHeader.vue';
import { computed } from 'vue';
import { getFullDayWithTimeString } from '/@/lib/basic/date'

const props = defineProps<{
    lastOnline?: string
}>();

const lastOnlineString = computed(() =>
  props.lastOnline
    ? getFullDayWithTimeString(new Date(props.lastOnline))
    : ''
)
</script>
