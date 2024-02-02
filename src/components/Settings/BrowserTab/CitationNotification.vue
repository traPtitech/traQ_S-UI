<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>引用通知</h3>
      <p>
        引用されたときに通知をするかの設定です。この設定はすべての端末で共有されます。
      </p>
    </div>
    <div>
      <a-toggle :model-value="value" @update:model-value="toggleSetting" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import { onMounted } from 'vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import useToggle from '/@/composables/utils/useToggle'

const { addErrorToast } = useToastStore()
const { value, toggle } = useToggle()

onMounted(async () => {
  const { data } = await apis.getMyNotifyCitation()
  value.value = data.notifyCitation
})

const toggleSetting = async () => {
  try {
    await apis.changeMyNotifyCitation({ notifyCitation: !value.value })
    toggle()
  } catch {
    addErrorToast('引用通知設定に失敗しました')
  }
}
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
