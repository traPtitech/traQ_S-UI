<template>
  <section :class="$style.feature">
    <div>
      <h1>{{ user.displayName }}</h1>
      <p>
        <online-indicator-with-tooltip
          :user-id="user.id"
          :last-online="detail?.lastOnline ?? undefined"
        />
        @{{ user.name }}
      </p>
    </div>
    <link-buttons
      :home-channel-id="detail?.homeChannel ?? undefined"
      :user-name="user.name"
      show-title
    />
  </section>
</template>

<script lang="ts" setup>
import OnlineIndicatorWithTooltip from './OnlineIndicatorWithTooltip.vue'
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
}
</style>
