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

<script lang="ts" setup>
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import QallController from './QallController/QallController.vue'
import DraftList from './DraftList/DraftList.vue'
import AudioController from './AudioController/AudioController.vue'
import type { EphemeralNavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

withDefaults(
  defineProps<{
    currentEphemeralNavigation?: EphemeralNavigationItemType
    transparent?: boolean
  }>(),
  {
    transparent: false
  }
)
</script>
