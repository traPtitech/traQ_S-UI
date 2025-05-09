<template>
  <div :class="$style.container">
    <form-button
      label="スタンプを追加する"
      :class="$style.form"
      icon="plus"
      mdi
      type="secondary"
      @click="handleOpenModal"
    />
  </div>
</template>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import { useFileSelect } from '/@/composables/dom/useFileSelect'
import { useModalStore } from '/@/store/ui/modal'

const { pushModal } = useModalStore()

const acceptImageType = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
].join(',')
const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  if (!files[0]) return
  pushModal({
    type: 'settings-stamp-create',
    file: files[0]
  })
})
const handleOpenModal = () => {
  selectImage()
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
