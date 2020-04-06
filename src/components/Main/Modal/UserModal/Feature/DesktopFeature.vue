<template>
  <section :class="$style.feature">
    <div>
      <h1>{{ user.displayName }}</h1>
      <p>
        <online-indicator :userId="user.id" />
        @{{ user.name }}
      </p>
    </div>
    <buttons :username="user.name" :showTitle="true" />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import OnlineIndicator from './OnlineIndicator.vue'
import Buttons from './Buttons.vue'

export default defineComponent({
  name: 'DesktopFeature',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  components: {
    OnlineIndicator,
    Buttons
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
