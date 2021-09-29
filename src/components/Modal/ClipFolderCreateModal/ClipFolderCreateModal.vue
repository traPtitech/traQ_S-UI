<template>
  <modal-frame
    title="クリップフォルダ作成"
    subtitle="メッセージを保存するフォルダを作成します"
    icon-name="bookmark"
    icon-mdi
  >
    <form-input
      v-model="name.val"
      label="名前"
      :class="$style.input"
      :max-length="30"
    />
    <form-text-area
      v-model="description.val"
      label="説明"
      :class="$style.input"
      :max-height="160"
      :max-length="1000"
    />
    <form-button
      label="作成"
      :disabled="!isCreateEnabled"
      :class="$style.button"
      @click="createClipFolder(name.val, description.val)"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue'
import apis from '/@/lib/apis'
import store from '/@/store'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormTextArea from '/@/components/UI/FormTextArea.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useMaxLength from '/@/use/maxLength'
import useToastStore from '/@/providers/toastStore'

const useCreateClipFolder = () => {
  const { addErrorToast } = useToastStore()

  const createClipFolder = async (name: string, description: string) => {
    try {
      await apis.createClipFolder({ name, description })
      store.dispatch.ui.modal.clearModal()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('クリップフォルダの作成に失敗しました', e)

      addErrorToast('クリップフォルダの作成に失敗しました')
    }
  }
  return { createClipFolder }
}

export default defineComponent({
  name: 'ClipFolderCreateModal',
  components: {
    ModalFrame,
    FormInput,
    FormTextArea,
    FormButton
  },
  setup() {
    const name = reactive({ val: '', maxLength: 30 })
    const description = reactive({ val: '', maxLength: 1000 })

    const { isExceeded: isNameExceeded } = useMaxLength(name)
    const { isExceeded: isDescriptionExceeded } = useMaxLength(description)

    const { createClipFolder } = useCreateClipFolder()
    const isCreateEnabled = computed(
      () =>
        name.val !== '' && !isNameExceeded.value && !isDescriptionExceeded.value
    )

    return { name, description, createClipFolder, isCreateEnabled }
  }
})
</script>

<style lang="scss" module>
.input {
  margin-bottom: 16px;
  width: 100%;
}
.button {
  display: block;
  margin-left: auto;
}
</style>
