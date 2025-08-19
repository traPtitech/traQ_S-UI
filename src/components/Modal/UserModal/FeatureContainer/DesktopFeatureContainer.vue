<template>
  <section :class="$style.feature">
    <div :class="$style.infoContainer">
      <h1 :class="$style.displayName">{{ user.displayName }}</h1>
      <div :class="$style.onlineContainer">
        <p>@{{ user.name }}</p>
        <online-indicator :user-id="user.id" has-text />
      </div>
    </div>
    <link-buttons
      :home-channel-id="detail?.homeChannel"
      :user-name="user.name"
      :class="$style.buttons"
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
  justify-content: center;
  gap: 1rem;
}
.infoContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.onlineContainer {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.buttons {
  margin: 8px 0;
}
.displayName {
  width: 80%;
}
</style>
