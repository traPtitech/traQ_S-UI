<template>
  <EphemeralNavigationContentContainer :transparent="transparent">
    <transition name="fade-bottom" mode="out-in">
      <SubQallView v-if="currentEphemeralNavigation === 'qallController'" />
      <DraftList v-else-if="currentEphemeralNavigation === 'draftList'" />
      <AudioController
        v-else-if="currentEphemeralNavigation === 'audioController'"
      />
    </transition>
  </EphemeralNavigationContentContainer>
</template>

<script lang="ts" setup>
import EphemeralNavigationContentContainer from './EphemeralNavigationContentContainer.vue'
import AudioController from './AudioController/AudioController.vue'
import type { EphemeralNavigationItemType } from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'
import SubQallView from '../../MainView/QallView/SubQallView.vue'
import DraftList from './DraftList/DraftList.vue'

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
