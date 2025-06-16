<template>
  <div :class="$style.container" :data-is-title="$boolAttr(isTitle)">
    <user-icon
      v-if="user"
      :class="$style.icon"
      :user-id="user.id"
      :size="isTitle ? 24 : 20"
    />
    <span :class="$style.displayName">
      {{ user?.displayName ?? 'unknown' }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import type { User } from '@traptitech/traq'

withDefaults(
  defineProps<{
    user?: User
    isTitle?: boolean
  }>(),
  {
    isTitle: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  display: flex;
  align-items: center;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  overflow: hidden;
  &[data-is-title] {
    @include color-ui-primary;
    @include size-body1;
    font-weight: bold;
  }
}
.icon {
  margin-right: 8px;
}
.displayName {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .container[data-is-title] & {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
    word-break: break-all;
  }
}
</style>
