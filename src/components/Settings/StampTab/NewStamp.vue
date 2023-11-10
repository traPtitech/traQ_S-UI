<template>
  <div :class="$style.container">
    <form-button
      label="スタンプを追加する"
      :class="$style.form"
      icon="plus"
      mdi
      color="secondary"
      @click="handleOpenModal"
    />
  </div>
</template>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'

const { pushModal } = useModalStore()

const handleOpenModal = () => {
  pushModal({
    type: 'settings-stamp-create'
  })
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.container {
  margin: 24px 0;
}
.form {
  margin: 8px 0;
}
</style>
