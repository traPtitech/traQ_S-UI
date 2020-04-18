<template>
  <section>
    <account />
    <notification />
    <div>
      <h3>起動時チャンネル設定</h3>
      <form-radio
        label="最後に開いたチャンネル"
        input-value="lastOpen"
        v-model="state.openMode"
      />
      <form-radio
        label="特定のチャンネル"
        input-value="particular"
        v-model="state.openMode"
      />
      <form-selector
        v-if="state.openMode === 'particular'"
        v-model="state.openChannelName"
        :options="channelOptions"
      />
    </div>
    <div>
      <h3>メッセージ送信スタイル</h3>
      <form-radio
        label="修飾キー+Enterで送信 / Enterで改行"
        input-value="modifier"
        v-model="state.sendWithModifierKey"
      />
      <form-radio
        label="Enterで送信 / 修飾キー+Enterで改行"
        input-value="none"
        v-model="state.sendWithModifierKey"
      />
      <div>
        修飾キーとして利用するキー
        <form-checkbox
          :label="getModifierKeyName('shift')"
          v-model="state.modifierKey.shift"
        />
        <form-checkbox
          :label="getModifierKeyName('alt')"
          v-model="state.modifierKey.alt"
        />
        <form-checkbox
          :label="getModifierKeyName('ctrl')"
          v-model="state.modifierKey.ctrl"
        />
        <form-checkbox
          v-if="macFlag"
          :label="getModifierKeyName('macCtrl')"
          v-model="state.modifierKey.macCtrl"
        />
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
import FormSelector from '@/components/UI/FormSelector.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormRadio from '@/components/UI/FormRadio.vue'
import FormCheckbox from '@/components/UI/FormCheckbox.vue'
import Toggle from '@/components/UI/Toggle.vue'
import Account from './Account.vue'
import Notification from './Notification.vue'
import useChannelPath from '@/use/channelPath'

const useChannelOptions = () => {
  const { channelIdToPath } = useChannelPath()
  return computed(() =>
    Object.values(store.state.entities.channels)
      .map(channel => {
        const path = channelIdToPath(channel.id).join('/')
        return {
          key: `#${path}`,
          value: path
        }
      })
      .sort((a, b) => (a.key > b.key ? 1 : -1))
  )
}

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

    const channelOptions = useChannelOptions()

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
    Account,
    Notification,
    FormRadio,
    FormSelector,
    FormInput,
    FormCheckbox,
    Toggle
  }
})
</script>

<style lang="scss" module></style>
