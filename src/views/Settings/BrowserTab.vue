<template>
  <section>
    <notification :class="$style.element" />
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
    <div :class="$style.element">
      <div :class="$style.echo">
        <h3 :class="$style.header">省エネモード</h3>
        <toggle v-model="state.ecoMode" :class="$style.toggle" />
      </div>
      <div :class="$style.content">
        <p>
          省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません
        </p>
      </div>
    </div>
    <caches />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/store'
import useSyncedState from '@/components/Settings/use/syncedState'
import Toggle from '@/components/UI/Toggle.vue'
import Notification from '@/components/Settings/BrowserTab/Notification.vue'
import Caches from '@/components/Settings/BrowserTab/Caches.vue'
import OpenMode from '@/components/Settings/BrowserTab/OpenMode.vue'
import SendKey from '@/components/Settings/BrowserTab/SendKey.vue'

export default defineComponent({
  name: 'BrowserTab',
  setup() {
    const browserSettings = computed(() => store.state.app.browserSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.browserSettings.set
    )

    return { state }
  },
  components: {
    Notification,
    OpenMode,
    SendKey,
    Toggle,
    Caches
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.echo {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
</style>
