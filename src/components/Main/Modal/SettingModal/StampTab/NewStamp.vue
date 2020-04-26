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
      <form-button label="新規登録" @click="createStamp" :class="$style.form" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import apis from '@/lib/apis'

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
