<template>
  <online-indicator :user-id="userId" :title="tooltip" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { getFullDayWithTimeString } from '/@/lib/date'
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'

export default defineComponent({
  name: 'OnlineIndicatorWithTooltip',
  components: {
    OnlineIndicator
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    lastOnline: String
  },
  setup(props) {
    const tooltip = computed(() =>
      props.lastOnline
        ? `Last Online: ${getFullDayWithTimeString(new Date(props.lastOnline))}`
        : undefined
    )

    return { tooltip }
  }
})
</script>
