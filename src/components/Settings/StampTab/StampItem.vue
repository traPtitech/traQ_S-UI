<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <img :src="url" :class="$style.stamp" />
    <div v-if="!isSelected" :class="$style.notSelected">
      <p>:{{ stamp.name }}:</p>
      <a-icon
        name="pencil-outline"
        mdi
        :size="20"
        :class="$style.editIcon"
        @click="onStartEdit"
      />
    </div>
    <div v-else :class="$style.selected">
      <div :class="$style.forms">
        <form-input
          v-model="state.name"
          label="スタンプ名"
          prefix=":"
          suffix=":"
          :max-length="32"
        />
        <form-selector
          v-model="state.creatorId"
          label="所有者"
          :options="creatorOptions"
        />
        <image-upload v-model="newImageData" />
      </div>
      <form-button
        label="変更"
        :class="$style.changeButton"
        :disabled="!stampChanged || !isNameValid"
        :loading="isEditing"
        @click="editStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, reactive, ref } from 'vue'
import apis, { buildFilePath, formatResizeError } from '/@/lib/apis'
import type { Stamp } from '@traptitech/traq'
import useStateDiff from '../composables/useStateDiff'
import { isValidStampName } from '/@/lib/validate'
import { useToastStore } from '/@/store/ui/toast'
import { imageSize } from './imageSize'

type StampEditState = Pick<Stamp, 'name' | 'creatorId'>

const useState = (props: { stamp: Stamp }) => {
  const oldState = computed(
    (): StampEditState => ({
      name: props.stamp.name,
      creatorId: props.stamp.creatorId
    })
  )
  const newState = reactive({ ...oldState.value })

  const { hasDiff, getDiffKeys } = useStateDiff<StampEditState>()
  const isStateChanged = computed(() => hasDiff(newState, oldState))
  const diffKeys = computed(() => getDiffKeys(newState, oldState))

  return { state: newState, isStateChanged, diffKeys }
}

const useStampEdit = (
  props: { stamp: Stamp },
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
      if (!newImageData.value) {
        addErrorToast('画像を選択してください')
        return
      }
      const size = await imageSize(newImageData.value)
      if (size.height !== size.width) {
        addErrorToast('画像が正方形ではありません。編集してください')
        return
      }
      try {
        isEditing.value = true
        const promises = []
        if (isStateChanged.value) {
          promises.push(
            apis.editStamp(props.stamp.id, {
              name: diffKeys.value.includes('name') ? state.name : undefined,
              creatorId: diffKeys.value.includes('creatorId')
                ? state.creatorId
                : undefined
            })
          )
        }
        if (newImageData.value !== undefined) {
          promises.push(
            apis.changeStampImage(props.stamp.id, newImageData.value)
          )
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
</script>

<script lang="ts" setup>
import ImageUpload from '../ImageUpload.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useUserList from '/@/composables/users/useUserList'

const props = withDefaults(
  defineProps<{
    stamp: Stamp
    isSelected?: boolean
  }>(),
  {
    isSelected: false
  }
)

const emit = defineEmits<{
  (e: 'startEdit'): void
  (e: 'endEdit'): void
}>()

const url = computed(() => buildFilePath(props.stamp.fileId))

const userList = useUserList(['inactive', 'bot'])
const creatorOptions = computed(() =>
  userList.value.map(u => ({ key: `@${u.name}`, value: u.id }))
)

const newImageData = ref<File | undefined>()

const { state, isStateChanged, diffKeys } = useState(props)
const stampChanged = computed(
  () => isStateChanged.value || newImageData.value !== undefined
)
const isNameValid = computed(() => isValidStampName(state.name))

const onStartEdit = () => {
  emit('startEdit')
}
const onEndEdit = () => {
  emit('endEdit')
}

const { isEditing, editStamp } = useStampEdit(
  props,
  state,
  newImageData,
  isStateChanged,
  diffKeys,
  () => {
    newImageData.value = undefined
    onEndEdit()
  }
)
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  display: flex;
  align-items: center;
  padding: {
    left: 12px;
    top: 12px;
    bottom: 12px;
  }
  &:not([aria-selected='true']):hover {
    @include background-tertiary;
  }
}

.editIcon {
  .container:not(:hover) & {
    display: none;
  }
}

.stamp {
  height: 40px;
  width: 40px;
}
.notSelected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 24px;
}
.selected {
  padding-left: 12px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.forms {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;
  gap: 12px;
}
.changeButton {
  word-break: keep-all;
}
</style>
