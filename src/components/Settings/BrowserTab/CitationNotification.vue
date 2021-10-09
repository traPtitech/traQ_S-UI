<template>
  <div>
    <div :class="$style.eco">
      <h3 :class="$style.header">引用通知</h3>
      <toggle
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

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import apis from '/@/lib/apis'
import Toggle from '/@/components/UI/Toggle.vue'
import useToastStore from '/@/providers/toastStore'

export default defineComponent({
  name: 'CitationNotification',
  components: {
    Toggle
  },
  setup() {
    const { addErrorToast } = useToastStore()
    const value = ref(false)

    onMounted(async () => {
      const { data } = await apis.getMyNotifyCitation()
      value.value = data.notifyCitation
    })

    const toggleSetting = async () => {
      try {
        await apis.changeMyNotifyCitation({ notifyCitation: !value.value })
        value.value = !value.value
      } catch {
        addErrorToast('引用通知設定に失敗しました')
      }
    }

    return { value, toggleSetting }
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
