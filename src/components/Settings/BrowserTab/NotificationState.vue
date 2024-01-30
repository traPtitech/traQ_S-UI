<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>この端末/ブラウザでの通知</h3>
      <div>
        <form-button
          v-if="permission === 'default'"
          label="設定"
          @click="requestPermission"
        />
        <p v-else>ブラウザや端末の設定から変更できます</p>
      </div>
    </div>
    <div>
      <a-toggle :model-value="permission === 'granted'" disabled />
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { requestNotificationPermission } from '/@/lib/notification/requestPermission'
import AToggle from '/@/components/UI/AToggle.vue'

const useNotificationPermission = () => {
  const permission = ref<NotificationPermission>()
  permission.value = window.Notification?.permission

  const requestPermission = async () => {
    // permission.valueがundefinedでないときは、
    // 上の取得の仕方からNotificationが存在していることが確定している
    permission.value = await requestNotificationPermission()
  }

  return { permission, requestPermission, status }
}
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'

const { permission, status, requestPermission } = useNotificationPermission()
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
