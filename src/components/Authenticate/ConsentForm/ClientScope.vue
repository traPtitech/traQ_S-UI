<template>
  <li :class="$style.container" :data-is-open="isOpen">
    <div :class="$style.name" @click="toggleOpen">
      {{ name }}
      <icon :class="$style.icon" name="rounded-triangle" />
    </div>
    <slide-down :is-open="isOpen">
      <ul :class="$style.permissions">
        <li v-for="permission in permissions" :key="permission">
          {{ permission }}
        </li>
      </ul>
    </slide-down>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue'
import { OAuth2Scope } from '@traptitech/traq'
import SlideDown from '@/components/UI/SlideDown.vue'
import Icon from '@/components/UI/Icon.vue'

const scopeNameMap: Record<OAuth2Scope, string> = {
  [OAuth2Scope.Read]: 'データの読み取り',
  [OAuth2Scope.Write]: 'データの書き込み',
  [OAuth2Scope.ManageBot]: 'BOTの管理'
}
const scopePermissionsMap: Record<OAuth2Scope, string[]> = {
  [OAuth2Scope.Read]: [
    'チャンネル情報の取得',
    'メッセージの取得',
    'チャンネル購読状況の取得',
    '通知の受け取り',
    'ユーザー情報の取得',
    '自ユーザー情報の取得',
    'スターチャンネルの取得',
    '未読メッセージ一覧の取得',
    'ユーザーのタグの取得',
    'ユーザーグループの取得',
    'スタンプ情報の取得',
    '自分のスタンプ履歴の取得',
    'ファイルのダウンロード',
    'Webhook情報の取得',
    'BOT情報の取得',
    'クリップフォルダの取得',
    'スタンプパレットの取得'
  ],
  [OAuth2Scope.Write]: [
    'チャンネルの作成',
    'チャンネルトピックの変更',
    'メッセージの投稿/編集/削除/通報',
    'メッセージのピン留め/ピン留めの解除',
    'チャンネル購読の変更',
    '通知デバイスの登録',
    '自ユーザー情報/アイコンの変更',
    'スターチャンネルの変更',
    'メッセージの既読化',
    'ユーザーのタグの変更',
    'ユーザーグループの作成/編集/削除',
    'スタンプの作成',
    'メッセージへのスタンプの追加/削除',
    '自分の管理しているスタンプの変更',
    'ファイルのアップロード/削除',
    'クリップフォルダーの作成/変更/削除',
    'スタンプパレットの作成/編集/削除'
  ],
  [OAuth2Scope.ManageBot]: [
    'チャンネル情報の取得',
    'ユーザー情報の取得',
    '自ユーザー情報の取得',
    'Webhook情報の取得',
    'Webhookの作成/変更/削除',
    'BOTの情報の取得',
    'BOTの作成/変更/削除',
    'BOTのチャンネルへの参加/参加解除',
    'Clientの情報の取得',
    'Clientの作成/編集/削除'
  ]
}

export default defineComponent({
  name: 'ClientScope',
  components: {
    SlideDown,
    Icon
  },
  props: {
    scope: {
      type: String as PropType<OAuth2Scope>,
      required: true
    }
  },
  setup(props) {
    const name = computed(() => scopeNameMap[props.scope])
    const permissions = computed(() => scopePermissionsMap[props.scope])

    const isOpen = ref(false)
    const toggleOpen = () => {
      isOpen.value = !isOpen.value
    }

    return { name, permissions, isOpen, toggleOpen }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 12px;
  border-radius: 4px;
}
.name {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
}
.icon {
  margin-left: auto;
  transform: rotate(0turn);
  .container[data-is-open] & {
    transform: rotate(0.5turn);
  }
  transition: 0.5s;
}
.permissions.permissions {
  padding-left: 24px;
  list-style: disc;
}
</style>
