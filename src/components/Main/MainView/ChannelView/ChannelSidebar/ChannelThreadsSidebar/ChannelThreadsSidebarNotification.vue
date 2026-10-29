<template>
  <SidebarContentContainerSelect
    title="デフォルトの通知設定"
    @click="changeNotification"
  >
    <AIcon :name="iconName" />
  </SidebarContentContainerSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SidebarContentContainerSelect from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerSelect.vue'
import AIcon from '/@/components/UI/AIcon.vue'

const iconName = ref('notified-or-subscribed')

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
