<template>
  <ephemeral-navigation-content-container :transparent="transparent">
    <transition name="fade-bottom" mode="out-in">
      <qall v-if="currentEphemeralNavigation === 'qall'" />
      <drafts v-else-if="currentEphemeralNavigation === 'drafts'" />
      <audio-controller
        v-else-if="currentEphemeralNavigation === 'audioController'"
      />
    </transition>
  </ephemeral-navigation-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EphemeralNavigationItemType } from '/@/components/Main/Navigation/use/navigationConstructor'
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import Qall from './Qall/Qall.vue'
import Drafts from './Drafts/Drafts.vue'
import AudioController from './AudioController/AudioController.vue'

export default defineComponent({
  name: 'EphemeralNavigationContent',
  components: {
    EphemeralNavigationContentContainer,
    Qall,
    Drafts,
    AudioController
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
