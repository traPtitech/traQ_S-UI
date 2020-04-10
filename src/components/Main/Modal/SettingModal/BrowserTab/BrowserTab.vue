<template>
  <section :class="$style.container">
    <div>
      <h3>アカウント</h3>
      <button @click="onLogoutClick">ログアウト</button>
      <button @click="onSessionDelete">全セッション破棄</button>
    </div>
    <div>
      <h3>通知: {{ notifyPermissionStatus }}</h3>
      <button
        v-if="notifyPermission === 'default'"
        @click="requestNotifyPermission"
      >
        設定
      </button>
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
      <div :class="$style.channelInput">
        <input type="text" v-model="state.openChannelName" />
      </div>
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
        <label>
          <input type="checkbox" v-model="state.modifierShift" />
          {{ getModifierKeyName('shift') }}
        </label>
        <label>
          <input type="checkbox" v-model="state.modifierAlt" />
          {{ getModifierKeyName('alt') }}
        </label>
        <label>
          <input type="checkbox" v-model="state.modifierCtrl" />
          {{ getModifierKeyName('ctrl') }}
        </label>
        <label v-if="macFlag">
          <input type="checkbox" v-model="state.modifierMacCtrl" />
          {{ getModifierKeyName('macCtrl') }}
        </label>
      </div>
    </div>
    <div>
      <h3>省エネモード</h3>
      <p>
        省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません
      </p>
      <label>
        <input type="checkbox" v-model="state.ecoMode" />
        ON / OFF
      </label>
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
import useStateDiff from '../use/stateDiff'

const NotifyPermissionStatusTable: Record<
  NotificationPermission | '',
  string
> = {
  default: '未設定（通知は来ません）',
  granted: '許可',
  denied: '拒否',
  '': ''
}

type SendKeys = 'alt' | 'ctrl' | 'shift' | 'macCtrl'

const windowsModifierKeyTable: Record<SendKeys, string> = {
  alt: 'Alt',
  ctrl: 'Ctrl',
  shift: 'Shift',
  macCtrl: ''
}
const macModifierKeyTable: Record<SendKeys, string> = {
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
    const state = reactive({
      ...browserSettings.value
    })
    const { getDiffKeys } = useStateDiff<
      typeof store.state.app.browserSettings
    >()

    watchEffect(() => {
      const diffKeys = getDiffKeys(state, browserSettings)
      diffKeys.forEach(key => {
        store.commit.app.browserSettings.set([key, state[key]])
      })
    })

    const macFlag = isMac()
    const getModifierKeyName = (key: SendKeys) => {
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
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}

.channelInput {
  &::before {
    content: '#';
  }
}
</style>
