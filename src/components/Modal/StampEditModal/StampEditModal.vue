<template>
  <modal-frame title="スタンプ編集" icon-name="">
    <div :class="$style.container">
      <image-upload v-model="newImageData" :class="$style.form" />
      <div :class="$style.rightContainer">
        <form-input
          v-model="state.name"
          label="スタンプ名"
          prefix=":"
          suffix=":"
          :max-length="32"
          :class="$style.form"
        />
        <form-selector
          v-model="state.creatorId"
          label="所有者"
          :options="creatorOptions"
        />
      </div>
    </div>
    <p v-if="newImageData" :class="$style.note">{{ cropperNote }}</p>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" color="secondary" @click="cancel" />
      <form-button
        label="更新する"
        :disabled="!stampChanged || !isNameValid"
        :loading="isEditing"
        :class="$style.form"
        @click="editStamp"
      />
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { computed, reactive, ref } from 'vue'
import apis, { formatResizeError } from '/@/lib/apis'
import type { Stamp } from '@traptitech/traq'
import useStateDiff from '/@/components/Settings/composables/useStateDiff'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from '/@/components/Settings/StampTab/imageSize'
import ImageUpload from '/@/components/Settings/ImageUpload.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useUserList from '/@/composables/users/useUserList'
import { useStampsStore } from '/@/store/entities/stamps'
import { useModalStore } from '/@/store/ui/modal'
import type { StampId } from '/@/types/entity-ids'
import ModalFrame from '../Common/ModalFrame.vue'
import { onMounted } from 'vue'

type StampEditState = Pick<Stamp, 'name' | 'creatorId'>

const props = defineProps<{
  id: StampId
}>()

const { clearModal } = useModalStore()
const { stampsMap } = useStampsStore()
const stamp = computed(() => stampsMap.value.get(props.id) ?? ({} as Stamp))

const userList = useUserList(['inactive', 'bot'])
const creatorOptions = computed(() =>
  userList.value.map(u => ({ key: `@${u.name}`, value: u.id }))
)

const newImageData = ref<File | undefined>()

const useState = (stamp: Stamp) => {
  const oldState = computed(
    (): StampEditState => ({
      name: stamp.name,
      creatorId: stamp.creatorId
    })
  )
  const newState = reactive({ ...oldState.value })

  const { hasDiff, getDiffKeys } = useStateDiff<StampEditState>()
  const isStateChanged = computed(() => hasDiff(newState, oldState))
  const diffKeys = computed(() => getDiffKeys(newState, oldState))

  return { state: newState, isStateChanged, diffKeys }
}

const useStampEdit = (
  stamp: Stamp,
  state: StampEditState,
  newImageData: Ref<File | undefined>,
  isStateChanged: Ref<boolean>,
  diffKeys: Ref<Array<keyof StampEditState>>,
  afterSuccess: () => void
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isEditing = ref(false)

  const editStamp = async () => {
    try {
      if (newImageData.value) {
        const size = await imageSize(newImageData.value)
        if (size.height !== size.width) {
          addErrorToast('画像が正方形ではありません。編集してください')
          return
        }
      }
      try {
        isEditing.value = true
        const promises = []
        if (isStateChanged.value) {
          promises.push(
            apis.editStamp(stamp.id, {
              name: diffKeys.value.includes('name') ? state.name : undefined,
              creatorId: diffKeys.value.includes('creatorId')
                ? state.creatorId
                : undefined
            })
          )
        }
        if (newImageData.value !== undefined) {
          promises.push(apis.changeStampImage(stamp.id, newImageData.value))
        }
        await Promise.all(promises)
        afterSuccess()

        addSuccessToast('スタンプを更新しました')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('スタンプの編集に失敗しました', e)

        addErrorToast(formatResizeError(e, 'スタンプの編集に失敗しました'))
      }
      isEditing.value = false
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('スタンプの編集に失敗しました', e)
      addErrorToast(formatResizeError(e, 'スタンプの編集に失敗しました'))
    }
  }

  return { isEditing, editStamp }
}

const { state, isStateChanged, diffKeys } = useState(stamp.value)
const stampChanged = computed(
  () => isStateChanged.value || newImageData.value !== undefined
)
const isNameValid = computed(() => isValidStampName(state.name))

const { isEditing, editStamp } = useStampEdit(
  stamp.value,
  state,
  newImageData,
  isStateChanged,
  diffKeys,
  () => {
    newImageData.value = undefined
    clearModal()
  }
)

const isGif = newImageData.value?.type === 'image/gif'
const cropperNote = computed(() =>
  isGif ? 'GIFは切り抜きできません' : '画像の位置・サイズを編集できます'
)

const cancel = () => {
  clearModal()
}

onMounted(async () => {
  const stampImage = (await apis.getStampImage(props.id)).data
  newImageData.value = new File([stampImage], 'stamp.png', {
    type: 'image/png'
  })
})
</script>

<style lang="scss" module>
.subtitle {
  a {
    pointer-events: none;
  }
}
.item {
  margin: 16px 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.rightContainer {
  width: 100%;
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
  margin-left: 12px;
  margin-bottom: 12px;
}
.buttonContainer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
</style>
