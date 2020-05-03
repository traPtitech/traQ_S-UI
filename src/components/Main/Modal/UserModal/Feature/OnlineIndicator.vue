<template>
  <span :class="$style.indicator" :data-is-online="isOnline" :title="tooltip" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { UserId } from '@/types/entity-ids'
import { getFullDayWithTimeString } from '@/lib/date'

export default defineComponent({
  name: 'OnlineIndicator',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    lastOnline: String
  },
  setup(props) {
    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.userId)
    )

    const tooltip = computed(() =>
      props.lastOnline
        ? `Last Online: ${getFullDayWithTimeString(new Date(props.lastOnline))}`
        : undefined
    )

    return { isOnline, tooltip }
  }
})
</script>

<style lang="scss" module>
.indicator {
  @include background-tertiary;
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid $theme-background-primary;
  &[data-is-online] {
    background: $theme-accent-online;
  }
}
</style>
