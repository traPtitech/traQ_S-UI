<template>
  <section :class="$style.feature">
    <div>
      <h1>{{ props.user.displayName }}</h1>
      <p>
        <online-indicator :userId="props.user.id" />
        @{{ props.user.name }}
      </p>
    </div>
    <buttons :username="props.user.name" :showTitle="true" />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import OnlineIndicator from './OnlineIndicator.vue'
import Buttons from './Buttons.vue'

interface Props {
  user: User
}

export default defineComponent({
  name: 'DesktopFeature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    return { props }
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
