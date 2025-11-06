<template>
  <div :class="$style.container">
    <UserIcon :user-id="userId" :size="24" />
    <OnlineIndicator :class="$style.indicator" :user-id="userId" :size="8" />
  </div>
</template>

<script lang="ts" setup>
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'

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
