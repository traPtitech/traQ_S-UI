<template>
  <div
    v-if="unreadCount > 0"
    :class="$style.container"
    :data-is-noticeable="$boolAttr(isNoticeable)"
  >
    {{ unreadCountString }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'ChannelElementUnreadBadge',
  props: {
    unreadCount: {
      type: Number,
      default: 0
    },
    isNoticeable: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const unreadCountString = computed(() => {
      if (props.unreadCount <= 0) return undefined
      if (props.unreadCount > 99) return '99+'
      return '' + props.unreadCount
    })
    return { unreadCountString }
  }
})
</script>

<style lang="scss" module>
.container {
  color: $theme-background-secondary;
  background: $theme-ui-secondary;
  padding: 0 4px;
  min-width: 24px;
  flex-shrink: 0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  &[data-is-noticeable] {
    background: $theme-accent-notification-background;
  }
}
</style>
