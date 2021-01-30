<template>
  <section>
    <notification :class="$style.element" />
    <div :class="$style.element">
      <h3 :class="$style.header">起動時チャンネル設定</h3>
      <div :class="$style.content">
        <div :class="$style.channel">
          <form-radio
            label="最後に開いたチャンネル"
            input-value="lastOpen"
            v-model="state.openMode"
          />
        </div>
        <div :class="$style.channel">
          <form-radio
            label="特定のチャンネル"
            input-value="particular"
            v-model="state.openMode"
          />
          <form-selector
            v-if="state.openMode === 'particular'"
            v-model="state.openChannelName"
            :options="channelOptions"
            :class="$style.selector"
          />
        </div>
      </div>
    </div>
    <div :class="$style.element">
      <h3 :class="$style.header">メッセージ送信スタイル</h3>
      <div :class="$style.content">
        <form-radio
          label="修飾キー+Enterで送信 / Enterで改行"
          input-value="modifier"
          v-model="state.sendWithModifierKey"
          :class="$style.sendWithModifierKey"
        />
        <form-radio
          label="Enterで送信 / 修飾キー+Enterで改行"
          input-value="none"
          v-model="state.sendWithModifierKey"
          :class="$style.sendWithModifierKey"
        />
        <div :class="$style.key">
          <p>修飾キーとして利用するキー</p>
          <div>
            <form-checkbox
              :label="getModifierKeyName('shift')"
              v-model="state.modifierKey.shift"
              :class="$style.keyCheckbox"
            />
            <form-checkbox
              :label="getModifierKeyName('alt')"
              v-model="state.modifierKey.alt"
              :class="$style.keyCheckbox"
            />
            <form-checkbox
              :label="getModifierKeyName('ctrl')"
              v-model="state.modifierKey.ctrl"
              :class="$style.keyCheckbox"
            />
            <form-checkbox
              v-if="macFlag"
              :label="getModifierKeyName('macCtrl')"
              v-model="state.modifierKey.macCtrl"
              :class="$style.keyCheckbox"
            />
          </div>
        </div>
      </div>
    </div>
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
import { isMac } from '@/lib/util/browser'
import { SendKeys } from '@/store/app/browserSettings'
import useSyncedState from '@/components/Settings/use/syncedState'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormRadio from '@/components/UI/FormRadio.vue'
import FormCheckbox from '@/components/UI/FormCheckbox.vue'
import Toggle from '@/components/UI/Toggle.vue'
import Notification from '@/components/Settings/BrowserTab/Notification.vue'
import Caches from '@/components/Settings/BrowserTab/Caches.vue'
import useChannelPath from '@/use/channelPath'
import useChannelOptions from '@/use/channelOptions'

const windowsModifierKeyTable: Record<keyof SendKeys, string> = {
  alt: 'Alt',
  ctrl: 'Ctrl',
  shift: 'Shift',
  macCtrl: ''
}
const macModifierKeyTable: Record<keyof SendKeys, string> = {
  alt: '⌥(Option)',
  ctrl: '⌘(Command)',
  shift: 'Shift',
  macCtrl: 'Ctrl'
}

export default defineComponent({
  name: 'BrowserTab',
  setup() {
    const { channelIdToPathString } = useChannelPath()

    // 起動時チャンネルの選択に必要
    store.dispatch.entities.fetchChannels()

    const browserSettings = computed(() => store.state.app.browserSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.browserSettings.set
    )

    const { channelOptions } = useChannelOptions(undefined, channel =>
      channel ? channelIdToPathString(channel.id) : '(unknown)'
    )

    const macFlag = isMac()
    const getModifierKeyName = (key: keyof SendKeys) => {
      return macFlag ? macModifierKeyTable[key] : windowsModifierKeyTable[key]
    }

    return {
      state,
      channelOptions,
      macFlag,
      getModifierKeyName
    }
  },
  components: {
    Notification,
    FormRadio,
    FormSelector,
    FormCheckbox,
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
.sendWithModifierKey {
  display: inline-block;
  margin-right: 12px;
}
.keyCheckbox {
  margin-right: 12px;
}
.channel {
  margin-bottom: 12px;
}
.selector {
  margin: {
    top: 4px;
    left: 12px;
  }
}
.content {
  margin-left: 12px;
}
.key {
  display: flex;
  margin-top: 16px;
  flex-flow: row wrap;
  align-items: center;
  > div {
    margin-left: 24px;
  }
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
