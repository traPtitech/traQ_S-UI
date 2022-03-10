<template>
  <indicator-dot
    :class="$style.container"
    :data-is-online="$boolAttr(isOnline)"
    :size="size"
    :border-width="borderWidth"
  />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import IndicatorDot from './IndicatorDot.vue'
import { useOnlineUsers } from '/@/store/domain/onlineUsers'

export default defineComponent({
  name: 'OnlineIndicator',
  components: {
    IndicatorDot
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    size: {
      type: Number,
      default: 12
    },
    borderWidth: {
      type: Number,
      default: 2
    }
  },
  setup(props) {
    const { onlineUsers, fetchOnlineUsers } = useOnlineUsers()

    fetchOnlineUsers()
    const isOnline = computed(() => onlineUsers.value.has(props.userId))

    return { isOnline }
  }
})
</script>

<style lang="scss" module>
.container {
  display: inline-block;
  border-color: $theme-ui-secondary-inactive;
  vertical-align: middle;

  &[data-is-online] {
    background: $theme-accent-online-default;
    border-color: transparent;
  }
}
</style>
