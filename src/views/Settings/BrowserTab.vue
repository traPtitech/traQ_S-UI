<template>
  <section>
    <notification-state :class="$style.element" />
    <citation-notification :class="$style.element" />
    <open-mode
      v-model:open-mode="state.openMode"
      v-model:open-channel-name="state.openChannelName"
      :class="$style.element"
    />
    <send-key
      v-model:sendWithModifierKey="state.sendWithModifierKey"
      v-model:modifierKey="state.modifierKey"
      :class="$style.element"
    />
    <eco-mode v-model="state.ecoMode" :class="$style.element" />
    <cache-manager :class="$style.element" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/vuex'
import useSyncedState from '/@/components/Settings/use/syncedState'
import NotificationState from '/@/components/Settings/BrowserTab/NotificationState.vue'
import CitationNotification from '/@/components/Settings/BrowserTab/CitationNotification.vue'
import CacheManager from '/@/components/Settings/BrowserTab/CacheManager.vue'
import OpenMode from '/@/components/Settings/BrowserTab/OpenMode.vue'
import SendKey from '/@/components/Settings/BrowserTab/SendKey.vue'
import EcoMode from '/@/components/Settings/BrowserTab/EcoMode.vue'

export default defineComponent({
  name: 'BrowserTab',
  components: {
    NotificationState,
    CitationNotification,
    OpenMode,
    SendKey,
    EcoMode,
    CacheManager
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
