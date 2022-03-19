<template>
  <div :class="$style.container">
    <div
      v-for="state in viewerStates"
      :key="state.id"
      :class="[state.inactive ? $style.notView : '', $style.member]"
    >
      <user-icon :size="28" :user-id="state.id" />
      <span :class="$style.name">{{ state.displayName }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { User } from '@traptitech/traq'
import UserIcon from '/@/components/UI/UserIcon.vue'

type ViewState = User & {
  inactive?: boolean
}

withDefaults(
  defineProps<{
    viewerStates?: ViewState[]
  }>(),
  {
    viewerStates: () => []
  }
)
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-secondary;
  display: flex;
  flex-direction: column;
}

.member {
  margin: 4px 0;
  display: flex;
  font-weight: bold;
  align-items: center;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.notView {
  opacity: 0.5;
}

.name {
  margin-left: 8px;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
</style>
