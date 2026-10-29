<template>
  <SidebarContentContainerSelect
    title="デフォルトの通知設定"
    :tooltip="notificationDescriptions[iconName]"
    @click="changeNotification"
  >
    <AIcon :name="iconName" />
  </SidebarContentContainerSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SidebarContentContainerSelect from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerSelect.vue'
import AIcon from '/@/components/UI/AIcon.vue'

const notificationDescriptions = {
  'notified-or-subscribed': 'チャンネルの通知設定を引き継ぐ',
  'not-subscribed': 'なし',
  subscribed: '未読管理',
  notified: '通知あり'
}

const iconName = ref<keyof typeof notificationDescriptions>(
  'notified-or-subscribed'
)

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
