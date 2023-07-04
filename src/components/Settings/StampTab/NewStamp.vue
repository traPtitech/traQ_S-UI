<template>
  <div :class="$style.element">
    <h3 :class="$style.header">スタンプ新規登録</h3>
    <div :class="$style.content">
      <image-upload v-model="stampImage" :class="$style.form" />
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
import type { Ref } from 'vue'
import { watch } from 'vue'
import { ref, computed } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from './imageSize'

/**
 * 拡張子を削る
 */
const trimExt = (filename: string) => filename.replace(/\.[^.]+$/, '')

const useStampCreate = (
  newStampName: Ref<string>,
  stampImage: Ref<File | undefined>
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isCreating = ref(false)

  const createStamp = async () => {
    if (!stampImage.value) return
    try {
      const size = await imageSize(stampImage.value)
      if (size.height !== size.width) {
        addErrorToast('画像が正方形ではありません。編集してください')
        return
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの作成に失敗しました', e)
      addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
    }
    try {
      isCreating.value = true
      await apis.createStamp(newStampName.value, stampImage.value)
      newStampName.value = ''
      stampImage.value = undefined

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

const stampImage = ref<File | undefined>()
const newStampName = ref('')
const isCreateEnabled = computed(
  () => isValidStampName(newStampName.value) && stampImage.value !== undefined
)
watch(
  () => stampImage.value,
  newImageData => {
    if (!newStampName.value && newImageData && newImageData.name) {
      newStampName.value = trimExt(newImageData.name)
    }
  }
)

const { isCreating, createStamp } = useStampCreate(newStampName, stampImage)
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
