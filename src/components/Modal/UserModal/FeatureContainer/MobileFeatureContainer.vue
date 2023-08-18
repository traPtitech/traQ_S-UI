<template>
  <section :class="$style.feature">
    <user-icon :user-id="user.id" prevent-modal :size="48" />
    <div :class="$style.names">
      <h1 :class="$style.displayName">{{ user.displayName }}</h1>
      <div :class="$style.nameInfo">
        <span :class="$style.name">@{{ user.name }}</span>
        <online-indicator :user-id="user.id" has-text />
      </div>
    </div>
    <link-buttons
      :class="$style.buttons"
      :home-channel-id="detail?.homeChannel"
      :user-name="user.name"
    />
  </section>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import OnlineIndicator from '/@/components/UI/OnlineIndicator.vue'
import LinkButtons from './LinkButtons.vue'
import type { User, UserDetail } from '@traptitech/traq'

defineProps<{
  user: User
  detail?: UserDetail
}>()
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  display: grid;
  grid-template-columns: 48px 1fr auto;
  column-gap: 16px;
  width: 100%;
  align-items: center;
  padding: {
    left: 16px;
    right: 32px;
    top: 16px;
    bottom: 16px;
  }
}
.names {
  @include size-body2;
  min-width: 0;
}
.displayName {
  @include size-h3;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
.nameInfo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 0.625rem;
}
.name {
  word-break: break-all;
}
.buttons {
  margin-right: 8px;
}
</style>
