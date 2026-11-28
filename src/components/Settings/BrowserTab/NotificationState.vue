<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>この端末/ブラウザでの通知</h3>
      <div>
        <FormButton
          v-if="permission === 'default'"
          label="設定"
          @click="requestPermission"
        />
        <p v-else-if="permission === undefined">
          このブラウザは通知に対応していません。iPhone / iPad
          の場合はホーム画面に追加すると通知を受け取れます
        </p>
        <p v-else>ブラウザや端末の設定から変更できます</p>
      </div>
    </div>
    <div>
      <AToggle :model-value="permission === 'granted'" disabled />
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

import AToggle from '/@/components/UI/AToggle.vue'
import { requestNotificationPermission } from '/@/lib/notification/notification'

const useNotificationPermission = () => {
  const permission = ref<NotificationPermission>()
  // iOS の Safari (ホーム画面に追加していない場合) などでは Notification が存在しない
  permission.value =
    'Notification' in window ? Notification.permission : undefined

  const requestPermission = async () => {
    // 許可された場合はプッシュ通知の登録まで行う
    permission.value = await requestNotificationPermission()
  }

  return { permission, requestPermission }
}
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'

const { permission, requestPermission } = useNotificationPermission()
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
