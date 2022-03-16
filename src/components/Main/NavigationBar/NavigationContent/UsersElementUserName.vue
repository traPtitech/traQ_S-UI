<template>
  <div :class="$style.container">
    <div :class="$style.displayName">
      {{ user.displayName }}
    </div>
    <div :class="$style.name">
      <online-indicator :user-id="user.id" :size="10" />
      @{{ user.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'
import { User } from '@traptitech/traq'

defineProps<{
  user: User
}>()
</script>

<style lang="scss" module>
.container {
  min-width: 0;
}
.displayName {
  @include color-ui-primary;
  @include size-body1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.name {
  @include color-ui-secondary;
  @include size-body2;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
