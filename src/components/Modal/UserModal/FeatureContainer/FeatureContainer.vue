<template>
  <mobile-feature-container v-if="isMobile" :user="user" :detail="detail" />
  <desktop-feature-container v-else :user="user" :detail="detail" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/store'
import { User, UserDetail } from '@traptitech/traq'
import DesktopFeatureContainer from './DesktopFeatureContainer.vue'
import MobileFeatureContainer from './MobileFeatureContainer.vue'

export default defineComponent({
  name: 'FeatureContainer',
  components: {
    DesktopFeatureContainer,
    MobileFeatureContainer
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
    const isMobile = computed(() => store.state.ui.isMobile)

    return {
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
