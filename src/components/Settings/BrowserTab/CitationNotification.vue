<template>
  <div>
    <div :class="$style.eco">
      <h3 :class="$style.header">引用通知</h3>
      <a-toggle
        :model-value="value"
        :class="$style.toggle"
        @update:model-value="toggleSetting"
      />
    </div>
    <div :class="$style.content">
      <p>
        引用されたときに通知をするかの設定です。この設定はすべての端末で共有されます。
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import { onMounted } from 'vue'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import useToggle from '/@/composables/useToggle'

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
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.eco {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
</style>
