<template>
  <section>
    <notification :class="$style.element" />
    <citation-notification :class="$style.element" />
    <open-mode
      :class="$style.element"
      v-model:open-mode="state.openMode"
      v-model:open-channel-name="state.openChannelName"
    />
    <send-key
      :class="$style.element"
      v-model:sendWithModifierKey="state.sendWithModifierKey"
      v-model:modifierKey="state.modifierKey"
    />
    <eco-mode :class="$style.element" v-model="state.ecoMode" />
    <caches :class="$style.element" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/store'
import useSyncedState from '@/components/Settings/use/syncedState'
import Notification from '@/components/Settings/BrowserTab/Notification.vue'
import CitationNotification from '@/components/Settings/BrowserTab/CitationNotification.vue'
import Caches from '@/components/Settings/BrowserTab/Caches.vue'
import OpenMode from '@/components/Settings/BrowserTab/OpenMode.vue'
import SendKey from '@/components/Settings/BrowserTab/SendKey.vue'
import EcoMode from '@/components/Settings/BrowserTab/EcoMode.vue'

export default defineComponent({
  name: 'BrowserTab',
  components: {
    Notification,
    CitationNotification,
    OpenMode,
    SendKey,
    EcoMode,
    Caches
  },
  setup() {
    const browserSettings = computed(() => store.state.app.browserSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.browserSettings.set
    )
    return { state }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
</style>
