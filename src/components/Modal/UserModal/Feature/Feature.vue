<template>
  <mobile-feature v-if="isMobile" :user="user" :detail="detail" />
  <desktop-feature v-else :user="user" :detail="detail" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/store'
import { User, UserDetail } from '@traptitech/traq'
import DesktopFeature from './DesktopFeature.vue'
import MobileFeature from './MobileFeature.vue'

export default defineComponent({
  name: 'Feature',
  components: {
    DesktopFeature,
    MobileFeature
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
