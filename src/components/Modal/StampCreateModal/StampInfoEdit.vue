<template>
  <div>
    <div :class="$style.container">
      <div :class="$style.leftContainer">
        <img :class="$style.img" :src="imageUrl" width="136" height="136" />
      </div>
      <div>
        <form-input
          v-model="newStampName"
          label="スタンプ名"
          prefix=":"
          suffix=":"
          :max-length="32"
          :class="$style.form"
          focus-on-mount
        />
        <label :class="$style.label">所有者</label>
        <p :class="$style.creator">@ {{ detail?.name }}</p>
      </div>
    </div>
    <div :class="$style.buttonContainer">
      <form-button label="戻る" type="tertiary" @click="back" />
      <form-button
        label="登録する"
        :loading="isCreating"
        :class="$style.form"
        @click="createStamp"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, type Ref } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import FormInput from '/@/components/UI/FormInput.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useMeStore } from '/@/store/domain/me'
import { useModalStore } from '/@/store/ui/modal'
import type { AxiosError } from 'axios'

const props = defineProps<{
  stampImage: File
}>()
const emit = defineEmits<{
  (e: 'back'): void
}>()

const { detail } = useMeStore()
const { clearModal } = useModalStore()

const imageUrl = computed(() => URL.createObjectURL(props.stampImage))
const newStampName = ref('')

const useStampCreate = (newStampName: Ref<string>, stampImage: File) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isCreating = ref(false)

  const createStamp = async () => {
    try {
      isCreating.value = true
      await apis.createStamp(newStampName.value, stampImage)

      addSuccessToast('スタンプを登録しました')
      URL.revokeObjectURL(imageUrl.value)
      clearModal()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの作成に失敗しました', e)

      const err = e as AxiosError<{ message: string }>
      if (!err.response) {
        addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
        return
      }
      const message: string = err.response.data.message
      switch (message) {
        case 'this name has already been used':
          addErrorToast('このスタンプ名は既に使われています')
          break
        default:
          addErrorToast(formatResizeError(e, 'スタンプの作成に失敗しました'))
      }
    }
    isCreating.value = false
  }

  return { isCreating, createStamp }
}

const { isCreating, createStamp } = useStampCreate(
  newStampName,
  props.stampImage
)
const back = () => {
  emit('back')
}
</script>

<style lang="scss" module>
.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.leftContainer {
  min-width: 136px;
  width: 136px;
  height: 136px;
  margin: 8px 0;
  flex-grow: 1;
}
.img {
  border: 1px solid $theme-accent-primary-default;
}

.label {
  @include color-ui-secondary;
  margin-bottom: 16px;
}
.creator {
  @include color-ui-primary;
}
.note {
  @include color-ui-secondary;
  margin-bottom: 12px;
  font-size: 12px;
}
.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
</style>
