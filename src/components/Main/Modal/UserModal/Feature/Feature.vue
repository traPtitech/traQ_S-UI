<template>
  <mobile-feature v-if="isMobile" :user="props.user" />
  <desktop-feature v-else :user="props.user" />
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import DesktopFeature from './DesktopFeature.vue'
import MobileFeature from './MobileFeature.vue'

interface Props {
  user: User
}

export default defineComponent({
  name: 'Feature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const isMobile = computed(() => store.getters.ui.isMobile)

    return {
      props,
      isMobile
    }
  },
  components: {
    DesktopFeature,
    MobileFeature
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
