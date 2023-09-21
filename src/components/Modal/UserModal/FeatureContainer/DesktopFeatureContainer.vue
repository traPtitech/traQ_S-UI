<template>
  <section :class="$style.feature">
    <div>
      <h1>{{ user.displayName }}</h1>
      <div :class="$style.onlineContainer">
        <p>@{{ user.name }}</p>
        <online-indicator :user-id="user.id" has-text />
      </div>
    </div>
    <link-buttons
      :home-channel-id="detail?.homeChannel"
      :user-name="user.name"
      show-title
    />
  </section>
</template>

<script lang="ts" setup>
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
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.onlineContainer {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
