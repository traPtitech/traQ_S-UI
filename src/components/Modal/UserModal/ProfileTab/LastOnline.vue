<template>
  <section>
    <profile-header text="最終オンライン日時" />
    <p>{{ lastOnlineString }}</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { getFullDayWithTimeString } from '@/lib/date'
import ProfileHeader from './ProfileHeader.vue'

export default defineComponent({
  name: 'LastOnline',
  components: {
    ProfileHeader
  },
  props: {
    lastOnline: String
  },
  setup(props) {
    const lastOnlineString = computed(() =>
      props.lastOnline
        ? getFullDayWithTimeString(new Date(props.lastOnline))
        : ''
    )
    return { lastOnlineString }
  }
})
</script>
