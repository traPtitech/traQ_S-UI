<template>
  <section :class="$style.feature">
    <user-icon :user-id="user.id" :prevent-modal="true" :size="48" />
    <div :class="$style.name">
      <h1 :class="$style.displayName">{{ user.displayName }}</h1>
      <p>
        <online-indicator-with-tooltip
          :class="$style.name"
          :user-id="user.id"
          :last-online="detail ? detail.lastOnline : undefined"
        />
        @{{ user.name }}
      </p>
    </div>
    <buttons
      :home-channel-id="detail ? detail.homeChannel : undefined"
      :user-name="user.name"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { User, UserDetail } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'
import OnlineIndicatorWithTooltip from './OnlineIndicatorWithTooltip.vue'
import Buttons from './Buttons.vue'

export default defineComponent({
  name: 'MobileFeature',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    detail: Object as PropType<UserDetail>
  },
  setup() {
    return {}
  },
  components: {
    UserIcon,
    OnlineIndicatorWithTooltip,
    Buttons
  }
})
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
.displayName {
  @include size-h3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.name {
  @include size-body2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
