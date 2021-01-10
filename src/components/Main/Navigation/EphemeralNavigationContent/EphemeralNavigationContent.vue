<template>
  <ephemeral-navigation-content-container :transparent="transparent">
    <qall v-if="currentEphemeralNavigation === 'qall'" />
    <drafts v-else-if="currentEphemeralNavigation === 'drafts'" />
  </ephemeral-navigation-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EphemeralNavigationItemType } from '@/components/Main/Navigation/use/navigationConstructor'
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import Qall from './Qall/Qall.vue'
import Drafts from './Drafts/Drafts.vue'

export default defineComponent({
  name: 'EphemeralNavigationContent',
  components: {
    EphemeralNavigationContentContainer,
    Qall,
    Drafts
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
