<template>
  <indicator-dot
    :class="$style.container"
    :data-is-online="$boolAttr(isOnline)"
    :size="size"
    :border-width="borderWidth"
  />
</template>

<script lang="ts" setup>
import IndicatorDot from './IndicatorDot.vue';
import { computed } from 'vue';
import { UserId } from '/@/types/entity-ids'
import { useOnlineUsers } from '/@/store/domain/onlineUsers'

const props = withDefaults(defineProps<{
    userId: UserId,
    size?: number,
    borderWidth?: number
}>(), {
    size: 12,
    borderWidth: 2
});

const { onlineUsers, fetchOnlineUsers } = useOnlineUsers()

fetchOnlineUsers()
const isOnline = computed(() => onlineUsers.value.has(props.userId))
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
