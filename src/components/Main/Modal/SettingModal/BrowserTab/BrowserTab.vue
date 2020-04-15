<template>
  <section>
    <account />
    <notification />
    <div>
      <h3>起動時チャンネル設定</h3>
      <label>
        <input type="radio" value="lastOpen" v-model="state.openMode" />
        最後に開いたチャンネル
      </label>
      <label>
        <input type="radio" value="particular" v-model="state.openMode" />
        特定のチャンネル
      </label>
      <form-input
        v-if="state.openMode === 'particular'"
        v-model="state.openChannelName"
        prefix="#"
      />
    </div>
    <div>
      <h3>メッセージ送信スタイル</h3>
      <label>
        <input
          type="radio"
          value="modifier"
          v-model="state.sendWithModifierKey"
        />
        修飾キー+Enterで送信 / Enterで改行
      </label>
      <label>
        <input type="radio" value="none" v-model="state.sendWithModifierKey" />
        Enterで送信 / 修飾キー+Enterで改行
      </label>
      <div>
        修飾キーとして利用するキー
        <label>
          <input type="checkbox" v-model="state.modifierKey.shift" />
          {{ getModifierKeyName('shift') }}
        </label>
        <label>
          <input type="checkbox" v-model="state.modifierKey.alt" />
          {{ getModifierKeyName('alt') }}
        </label>
        <label>
          <input type="checkbox" v-model="state.modifierKey.ctrl" />
          {{ getModifierKeyName('ctrl') }}
        </label>
        <label v-if="macFlag">
          <input type="checkbox" v-model="state.modifierKey.macCtrl" />
          {{ getModifierKeyName('macCtrl') }}
        </label>
      </div>
    </div>
    <div>
      <h3>省エネモード</h3>
      <p>
        省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません
      </p>
      <toggle
        @input="state.ecoMode = !state.ecoMode"
        :enabled="state.ecoMode"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { isMac } from '@/lib/util/browser'
import { SendKeys } from '@/store/app/browserSettings'
import useSyncedState from '../use/syncedState'
import FormInput from '@/components/UI/FormInput.vue'
import Toggle from '@/components/UI/Toggle.vue'
import Account from './Account.vue'
import Notification from './Notification.vue'

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
    const browserSettings = computed(() => store.state.app.browserSettings)
    const { state } = useSyncedState(
      browserSettings,
      store.commit.app.browserSettings.set
    )

    const macFlag = isMac()
    const getModifierKeyName = (key: keyof SendKeys) => {
      return macFlag ? macModifierKeyTable[key] : windowsModifierKeyTable[key]
    }

    return {
      state,
      macFlag,
      getModifierKeyName
    }
  },
  components: {
    Account,
    Notification,
    FormInput,
    Toggle
  }
})
</script>

<style lang="scss" module></style>
