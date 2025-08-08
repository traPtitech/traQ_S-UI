<template>
  <section :class="$style.browserTab">
    <notification-state />
    <citation-notification />
    <eco-mode v-model="state.ecoMode" />
    <open-mode
      v-model:open-mode="state.openMode"
      v-model:open-channel-name="state.openChannelName"
    />
    <prioritize-starred-channel v-model="state.prioritizeStarredChannel" />
    <prioritize-notified-channel v-model="state.prioritizeNotifiedChannel" />
    <send-key v-model:send-with-modifier-key="state.sendWithModifierKey" />
    <modifier-keys v-model:modifier-key="state.modifierKey" />
    <cache-manager />
  </section>
</template>

<script lang="ts" setup>
import NotificationState from '/@/components/Settings/BrowserTab/NotificationState.vue'
import CitationNotification from '/@/components/Settings/BrowserTab/CitationNotification.vue'
import CacheManager from '/@/components/Settings/BrowserTab/CacheManager.vue'
import OpenMode from '/@/components/Settings/BrowserTab/OpenMode.vue'
import SendKey from '/@/components/Settings/BrowserTab/SendKey.vue'
import EcoMode from '/@/components/Settings/BrowserTab/EcoMode.vue'
import PrioritizeNotifiedChannel from '/@/components/Settings/BrowserTab/PrioritizeNotifiedChannel.vue'
import PrioritizeStarredChannel from '/@/components/Settings/BrowserTab/PrioritizeStarredChannel.vue'
import { reactive } from 'vue'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import ModifierKeys from '/@/components/Settings/BrowserTab/ModifierKeys.vue'

const state = reactive(useBrowserSettings())
</script>

<style lang="scss" module>
.browserTab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
