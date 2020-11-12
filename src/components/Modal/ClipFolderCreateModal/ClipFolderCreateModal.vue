<template>
  <modal-frame
    title="クリップフォルダ作成"
    subtitle="メッセージを保存するフォルダを作成します"
    icon-name="bookmark"
    icon-mdi
    :class="$style.container"
  >
    <form-input label="名前" :class="$style.input" v-model="name" />
    <form-input label="説明" :class="$style.input" v-model="description" />
    <form-button
      label="作成"
      :disabled="!isCreateEnabled"
      :class="$style.button"
      @click="createClipFolder(name, description)"
    />
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import apis from '@/lib/apis'
import store from '@/store'
import ModalFrame from '../Common/ModalFrame.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'

const useCreateClipFolder = () => {
  const createClipFolder = async (name: string, description: string) => {
    try {
      await apis.createClipFolder({ name, description })
      store.dispatch.ui.modal.clearModal()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('クリップフォルダの作成に失敗しました', e)

      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'クリップフォルダの作成に失敗しました'
      })
    }
  }
  return { createClipFolder }
}

export default defineComponent({
  name: 'ClipFolderCreateModal',
  components: {
    ModalFrame,
    FormInput,
    FormButton
  },
  setup() {
    const name = ref('')
    const description = ref('')
    const { createClipFolder } = useCreateClipFolder()
    const isCreateEnabled = computed(() => name.value !== '')
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
