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
    <buttons
      :home-channel-id="detail?.homeChannel ?? undefined"
      :user-name="user.name"
      show-title
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { User, UserDetail } from '@traptitech/traq'
import OnlineIndicatorWithTooltip from './OnlineIndicatorWithTooltip.vue'
import Buttons from './Buttons.vue'

export default defineComponent({
  name: 'DesktopFeature',
  components: {
    OnlineIndicatorWithTooltip,
    Buttons
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    detail: {
      type: Object as PropType<UserDetail>,
      default: undefined
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
