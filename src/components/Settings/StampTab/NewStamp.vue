<template>
  <div :class="$style.container">
    <form-button
      label="スタンプを追加する"
      :class="$style.form"
      icon="plus"
      mdi
      type="secondary"
      @click="selectImage"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useFileSelect } from '/@/composables/dom/useFileSelect'
import { useModalStore } from '/@/store/ui/modal'

const { pushModal } = useModalStore()

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

const originalImg = ref<File | undefined>()
const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  originalImg.value = files[0]

  if (!originalImg.value) return
  pushModal({
    type: 'settings-stamp-create',
    file: originalImg.value
  })
  originalImg.value = undefined
})
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
