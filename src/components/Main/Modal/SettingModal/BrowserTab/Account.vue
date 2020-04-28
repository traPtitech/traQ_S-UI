<template>
  <div>
    <h3>アカウント</h3>
    <div :class="$style.content">
      <form-button
        label="ログアウト"
        @click="onLogoutClick"
        :class="$style.logout"
      />
      <form-button label="全セッション破棄" @click="onSessionDelete" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import apis from '@/lib/apis'
import FormButton from '@/components/UI/FormButton.vue'

export default defineComponent({
  name: 'Account',
  setup(props, context) {
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
    return { onLogoutClick, onSessionDelete }
  },
  components: {
    FormButton
  }
})
</script>

<style lang="scss" module>
.content {
  margin-left: 12px;
}
.logout {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
