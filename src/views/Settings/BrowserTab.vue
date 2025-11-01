<template>
  <section :class="$style.browserTab">
    <NotificationState />
    <CitationNotification />
    <SimpleToggle
      v-model="state.ecoMode"
      title="省エネモード"
      description="省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません"
    />
    <OpenMode
      v-model:open-mode="state.openMode"
      v-model:open-channel-name="state.openChannelName"
    />
    <SimpleToggle
      v-model="state.prioritizeStarredChannel"
      title="未読画面でお気に入りを優先表示"
      description="未読チャンネル一覧でお気に入りチャンネルを優先的に表示するようにします。"
    />
    <SimpleToggle
      v-model="state.prioritizeNotifiedChannel"
      title="未読画面で通知を優先表示"
      description="未読チャンネル一覧で通知オンのチャンネルを優先的に表示するようにします。"
    />
    <SendKey v-model:send-with-modifier-key="state.sendWithModifierKey" />
    <ModifierKeys v-model:modifier-key="state.modifierKey" />
    <CacheManager />
  </section>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import CacheManager from '/@/components/Settings/BrowserTab/CacheManager.vue'
import CitationNotification from '/@/components/Settings/BrowserTab/CitationNotification.vue'
import ModifierKeys from '/@/components/Settings/BrowserTab/ModifierKeys.vue'
import NotificationState from '/@/components/Settings/BrowserTab/NotificationState.vue'
import OpenMode from '/@/components/Settings/BrowserTab/OpenMode.vue'
import SimpleToggle from '/@/components/Settings/BrowserTab/SimpleToggle.vue'
import SendKey from '/@/components/Settings/BrowserTab/SendKey.vue'
import { useBrowserSettings } from '/@/store/app/browserSettings'

const state = reactive(useBrowserSettings())
</script>

<style lang="scss" module>
.browserTab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
