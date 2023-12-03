<template>
  <modal-frame title="スタンプ編集">
    <div :class="$style.container">
      <div :class="$style.leftContainer">
        <button :class="$style.imgButton" @click="selectImage">
          <img :src="imageUrl" width="136" height="136" />
        </button>
      </div>
      <div>
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
    <p :class="$style.note">{{ note }}</p>
    <div :class="$style.buttonContainer">
      <form-button label="キャンセル" type="tertiary" @click="cancel" />
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
import apis, { buildFilePath, formatResizeError } from '/@/lib/apis'
import type { Stamp } from '@traptitech/traq'
import useStateDiff from '/@/components/Settings/composables/useStateDiff'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useUserList from '/@/composables/users/useUserList'
import { useStampsStore } from '/@/store/entities/stamps'
import { useModalStore } from '/@/store/ui/modal'
import type { StampId } from '/@/types/entity-ids'
import ModalFrame from '../Common/ModalFrame.vue'
import { useFileSelect } from '/@/composables/dom/useFileSelect'

type StampEditState = Pick<Stamp, 'name' | 'creatorId'>

const props = defineProps<{
  id: StampId
}>()

const { clearModal, pushModal } = useModalStore()
const { stampsMap } = useStampsStore()
const stamp = computed(() => stampsMap.value.get(props.id) ?? ({} as Stamp))

const userList = useUserList(['inactive', 'bot'])
const creatorOptions = computed(() =>
  userList.value.map(u => ({ key: `@${u.name}`, value: u.id }))
)

const newImageData = ref<File | undefined>()
const imageUrl = computed(() =>
  stamp.value ? buildFilePath(stamp.value.fileId) : ''
)

const acceptImageType = ['image/jpeg', 'image/png', 'image/gif'].join(',')

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

const note = '画像をクリックしてアップロード'

const cancel = () => {
  clearModal()
}

const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  if (!files[0]) return
  pushModal({
    type: 'settings-stamp-image-edit',
    file: files[0]
  })
})
</script>

<style lang="scss" module>
.form {
  margin: 8px 0;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.leftContainer {
  min-width: 136px;
  width: 136px;
  height: 136px;
  margin: 8px 0;
  flex-grow: 1;
}
.imgButton {
  width: 100%;
  height: 100%;
  border: 2px solid $theme-ui-secondary-default;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
