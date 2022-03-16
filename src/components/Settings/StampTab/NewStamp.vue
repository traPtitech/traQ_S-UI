<template>
  <div :class="$style.element">
    <h3 :class="$style.header">スタンプ新規登録</h3>
    <div :class="$style.content">
      <image-upload
        :destroy-flag="imageUploadState.destroyFlag"
        :class="$style.form"
        @input="onNewImgSet"
        @destroyed="onNewDestroyed"
      />
      <form-input
        v-model="newStampName"
        label="スタンプ名"
        prefix=":"
        suffix=":"
        :max-length="32"
        :class="$style.form"
      />
      <form-button
        label="新規登録"
        :disabled="!isCreateEnabled"
        :loading="isCreating"
        :class="$style.form"
        @click="createStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, Ref, watchEffect } from 'vue'
import useImageUpload, { ImageUploadState } from '../composables/useImageUpload'
import apis, { formatResizeError } from '/@/lib/apis'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'

/**
 * 拡張子を削る
 */
const trimExt = (filename: string) => filename.replace(/\.[^.]+$/, '')

const useStampCreate = (
  newStampName: Ref<string>,
  imageUploadState: ImageUploadState,
  destroyImageUploadState: () => void
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isCreating = ref(false)

  const createStamp = async () => {
    try {
      isCreating.value = true
      await apis.createStamp(newStampName.value, imageUploadState.imgData)
      newStampName.value = ''
      destroyImageUploadState()

      addSuccessToast('スタンプを登録しました')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの作成に失敗しました', e)

      addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
    }
    isCreating.value = false
  }

  return { isCreating, createStamp }
}
</script>

<script lang="ts" setup>
import ImageUpload from '../ImageUpload.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'

const {
  imageUploadState,
  destroyImageUploadState,
  onNewImgSet,
  onNewDestroyed
} = useImageUpload()

const newStampName = ref('')
const isCreateEnabled = computed(
  () =>
    isValidStampName(newStampName.value) &&
    imageUploadState.imgData !== undefined
)
watchEffect(() => {
  if (imageUploadState.imgData) {
    newStampName.value = trimExt(imageUploadState.imgData.name)
  }
})

const { isCreating, createStamp } = useStampCreate(
  newStampName,
  imageUploadState,
  destroyImageUploadState
)
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
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
