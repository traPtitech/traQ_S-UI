<template>
  <ephemeral-navigation-content-container :transparent="transparent">
    <qall v-if="currentEphemeralNavigation === 'qall'" />
  </ephemeral-navigation-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { EphemeralNavigationItemType } from '@/components/Main/Navigation/use/navigationConstructor'
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import Qall from './Qall/Qall.vue'

export default defineComponent({
  name: 'EphemeralNavigationContent',
  components: {
    EphemeralNavigationContentContainer,
    Qall
  },
  props: {
    currentEphemeralNavigation: String as PropType<EphemeralNavigationItemType>,
    transparent: { type: Boolean, default: false }
  },
  setup() {
    return {}
  }
})
</script>
