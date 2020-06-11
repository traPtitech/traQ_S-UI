<template>
  <div :class="$style.element">
    <h3>スタンプ新規登録</h3>
    <div :class="$style.content">
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
        :class="$style.form"
      />
      <form-input
        v-model="newStampName"
        label="スタンプ名"
        prefix=":"
        suffix=":"
        :class="$style.form"
      />
      <form-button
        label="新規登録"
        :disabled="!isCreateEnabled"
        @click="createStamp"
        :class="$style.form"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/apis'
import store from '@/store'

export default defineComponent({
  name: 'NewStamp',
  setup() {
    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const newStampName = ref('')

    const isCreateEnabled = computed(
      () => newStampName.value !== '' && imageUploadState.imgData !== undefined
    )

    const createStamp = async () => {
      try {
        // TODO: loading
        await apis.createStamp(newStampName.value, imageUploadState.imgData)
        newStampName.value = ''
        destroyImageUploadState()

        store.commit.ui.toast.addToast({
          type: 'success',
          text: 'スタンプを登録しました'
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('スタンプの作成に失敗しました', e)

        store.commit.ui.toast.addToast({
          type: 'error',
          text: 'スタンプの作成に失敗しました'
        })
      }
    }

    return {
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      newStampName,
      createStamp,
      isCreateEnabled
    }
  },
  components: {
    ImageUpload,
    FormInput,
    FormButton
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
.form {
  margin: 8px 0;
}
</style>
