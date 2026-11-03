<template>
  <PrimaryViewHeaderTools
    :notification="notification"
    @click-notification="changeNotification"
    @click-more="emit('clickMore')"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import PrimaryViewHeaderTools from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderTools.vue'

const emit = defineEmits<{
  (e: 'clickMore'): void
}>()

const notificationDescriptions = {
  'notified-or-subscribed': 'チャンネルの通知設定を引き継ぐ',
  'not-subscribed': 'なし',
  subscribed: '未読管理',
  notified: '通知あり'
}

// TODO: API 接続時に自動生成される型とスレッドの通知設定に置き換える
const iconName = ref<keyof typeof notificationDescriptions>(
  'notified-or-subscribed'
)
const notification = computed(() => ({
  state: iconName.value,
  iconName: iconName.value,
  tooltip: notificationDescriptions[iconName.value]
}))

const changeNotification = () => {
  switch (iconName.value) {
    case 'notified-or-subscribed':
      iconName.value = 'not-subscribed'
      break
    case 'not-subscribed':
      iconName.value = 'subscribed'
      break
    case 'subscribed':
      iconName.value = 'notified'
      break
    case 'notified':
      iconName.value = 'notified-or-subscribed'
      break
  }
}
</script>
