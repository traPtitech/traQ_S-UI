<template>
  <ephemeral-navigation-content-container :transparent="transparent">
    <transition name="fade-bottom" mode="out-in">
      <qall-controller v-if="currentEphemeralNavigation === 'qallController'" />
      <draft-list v-else-if="currentEphemeralNavigation === 'draftList'" />
      <audio-controller
        v-else-if="currentEphemeralNavigation === 'audioController'"
      />
    </transition>
  </ephemeral-navigation-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EphemeralNavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import QallController from './QallController/QallController.vue'
import DraftList from './DraftList/DraftList.vue'
import AudioController from './AudioController/AudioController.vue'

export default defineComponent({
  name: 'EphemeralNavigationContent',
  components: {
    EphemeralNavigationContentContainer,
    QallController,
    DraftList,
    AudioController
  },
  props: {
    currentEphemeralNavigation: {
      type: String as PropType<EphemeralNavigationItemType>,
      default: undefined
    },
    transparent: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
  }
})
</script>
