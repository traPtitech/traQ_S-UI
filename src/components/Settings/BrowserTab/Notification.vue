<template>
  <div>
    <h3 :class="$style.header">この端末/ブラウザでの通知: {{ status }}</h3>
    <div :class="$style.content">
      <form-button
        v-if="permission === 'default'"
        label="設定"
        @click="requestPermission"
      />
      <p v-else>ブラウザや端末の設定から変更できます</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { requestNotificationPermission } from '/@/lib/notification/requestPermission'

const statusTable: Record<NotificationPermission | '', string> = {
  default: '未設定（通知は来ません）',
  granted: '許可',
  denied: '拒否',
  '': '不明'
}

const useNotificationPermission = () => {
  const permission = ref<NotificationPermission>()
  permission.value = Notification?.permission

  const requestPermission = async () => {
    // permission.valueがundefinedでないときは、
    // 上の取得の仕方からNotificationが存在していることが確定している
    permission.value = await requestNotificationPermission()
  }

  const status = computed(() => statusTable[permission.value ?? ''])

  return { permission, requestPermission, status }
}

export default defineComponent({
  name: 'Notification',
  components: { FormButton },
  setup() {
    const { permission, status, requestPermission } =
      useNotificationPermission()
    return { permission, status, requestPermission }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
</style>
