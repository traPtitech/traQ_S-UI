<template>
  <div :class="$style.container">
    <user-icon :user-id="userId" :size="24" />
    <online-indicator :class="$style.indicator" :user-id="userId" :size="8" />
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'

defineProps<{
  userId: string
}>()
</script>

<style lang="scss" module>
.container {
  position: relative;
}
.indicator {
  @include background-primary;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
