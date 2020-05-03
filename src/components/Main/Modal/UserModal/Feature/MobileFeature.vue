<template>
  <section :class="$style.feature">
    <user-icon :user-id="user.id" :prevent-modal="true" :size="48" />
    <div :class="$style.name">
      <h1 :class="$style.displayName">{{ user.displayName }}</h1>
      <p>
        <online-indicator
          :class="$style.name"
          :user-id="user.id"
          :last-online="props.detail ? props.detail.lastOnline : undefined"
        />
        @{{ user.name }}
      </p>
    </div>
    <buttons
      :home-channel-id="props.detail ? props.detail.homeChannel : undefined"
      :user-name="user.name"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { User, UserDetail } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'
import OnlineIndicator from './OnlineIndicator.vue'
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
  setup(props) {
    return {
      // TODO: https://github.com/vuejs/composition-api/issues/291
      props: props as { detail?: UserDetail }
    }
  },
  components: {
    UserIcon,
    OnlineIndicator,
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
  @include h3-size;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.name {
  @include body2-size;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
