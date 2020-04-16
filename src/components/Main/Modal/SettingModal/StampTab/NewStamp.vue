<template>
  <div>
    <h3>スタンプ新規登録</h3>
    <image-upload
      @input="onNewImgSet"
      :destroy-flag="imageUploadState.destroyFlag"
      @destroyed="onNewDestroyed"
    />
    <form-input
      v-model="newStampName"
      label="スタンプ名"
      prefix=":"
      suffix=":"
    />
    <form-button label="新規登録" @click="createStamp" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/api'

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

    const createStamp = async () => {
      try {
        // TODO: loading
        await apis.createStamp(newStampName.value, imageUploadState.imgData)
        newStampName.value = ''
        destroyImageUploadState()
      } catch (e) {
        // TODO: error
      }
    }

    return {
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      newStampName,
      createStamp
    }
  },
  components: {
    ImageUpload,
    FormInput,
    FormButton
  }
})
</script>

<style lang="scss" module></style>
