<template>
  <section>
    <div>
      <h3>アカウント</h3>
      <form-button label="ログアウト" on-secondary @click="onLogoutClick" />
      <form-button
        label="全セッション破棄"
        on-secondary
        @click="onSessionDelete"
      />
    </div>
    <div>
      <h3>通知: {{ notifyPermissionStatus }}</h3>
      <form-button
        v-if="notifyPermission === 'default'"
        label="設定"
        on-secondary
        @click="requestNotifyPermission"
      />
      <p v-else>ブラウザや端末の設定から変更できます</p>
    </div>
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
import {
  defineComponent,
  SetupContext,
  ref,
  computed,
  reactive,
  watchEffect
} from '@vue/composition-api'
import apis from '@/lib/api'
import store from '@/store'
import { isMac } from '@/lib/util/browser'
import useSyncedState from '../use/syncedState'
import Toggle from '@/components/UI/Toggle.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { SendKeys } from '@/store/app/browserSettings'

const NotifyPermissionStatusTable: Record<
  NotificationPermission | '',
  string
> = {
  default: '未設定（通知は来ません）',
  granted: '許可',
  denied: '拒否',
  '': ''
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
  setup(_, context: SetupContext) {
    const onLogoutClick = async () => {
      await apis.logout()
      context.root.$router.push('/')
    }

    const onSessionDelete = async () => {
      // TODO: セッション表示と特定のセッション破棄とかする？
      if (
        window.confirm(
          'ログイン中のセッションを全て破棄します。（実行するとログアウトされます）'
        )
      ) {
        await apis.logout(undefined, true)
        context.root.$router.push('/')
      }
    }

    const notifyPermission = ref<NotificationPermission>()
    notifyPermission.value = Notification.permission
    const requestNotifyPermission = async () => {
      notifyPermission.value = await Notification.requestPermission()
    }
    const notifyPermissionStatus = computed(
      () => NotifyPermissionStatusTable[notifyPermission.value ?? '']
    )

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
      onLogoutClick,
      onSessionDelete,
      notifyPermission,
      requestNotifyPermission,
      notifyPermissionStatus,
      state,
      macFlag,
      getModifierKeyName
    }
  },
  components: {
    FormInput,
    FormButton,
    Toggle
  }
})
</script>

<style lang="scss" module></style>
