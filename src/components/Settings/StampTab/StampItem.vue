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
          :class="$style.form"
        />
        <form-selector
          v-model="state.creatorId"
          label="所有者"
          :options="creatorOptions"
          :class="$style.form"
        />
        <image-upload
          :destroy-flag="imageUploadState.destroyFlag"
          @input="onNewImgSet"
          @destroyed="onNewDestroyed"
        />
      </div>
      <form-button
        label="変更"
        :disabled="!stampChanged || !isNameValid"
        :loading="isEditing"
        @click="editStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, reactive, Ref, ref } from 'vue'
import apis, { buildFilePath, formatResizeError } from '/@/lib/apis'
import store from '/@/store'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload, { ImageUploadState } from '../use/imageUpload'
import FormInput from '/@/components/UI/FormInput.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { Stamp } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import { compareStringInsensitive } from '/@/lib/basic/string'
import useStateDiff from '../use/stateDiff'
import { isValidStampName } from '/@/lib/validate'
import useToastStore from '/@/providers/toastStore'

const creatorOptions = computed(() =>
  [...store.getters.entities.activeUsersMap.values()]
    .filter(u => !u.bot)
    .map(u => ({ key: `@${u.name}`, value: u.id }))
    .sort((a, b) => compareStringInsensitive(a.key, b.key))
)

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
  imageUploadState: ImageUploadState,
  isStateChanged: Ref<boolean>,
  diffKeys: Ref<Array<keyof StampEditState>>,
  afterSuccess: () => void
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()
  const isEditing = ref(false)

  const editStamp = async () => {
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
      if (imageUploadState.imgData !== undefined) {
        promises.push(
          apis.changeStampImage(props.stamp.id, imageUploadState.imgData)
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
  }

  return { isEditing, editStamp }
}

export default defineComponent({
  name: 'StampItem',
  components: {
    FormInput,
    FormSelector,
    FormButton,
    ImageUpload,
    AIcon
  },
  props: {
    stamp: {
      type: Object as PropType<Stamp>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    startEdit: () => true,
    endEdit: () => true
  },
  setup(props, { emit }) {
    const url = computed(() => buildFilePath(props.stamp.fileId))

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const { state, isStateChanged, diffKeys } = useState(props)
    const stampChanged = computed(
      () => isStateChanged.value || imageUploadState.imgData !== undefined
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
      imageUploadState,
      isStateChanged,
      diffKeys,
      () => {
        destroyImageUploadState()
        onEndEdit()
      }
    )

    return {
      url,
      state,
      creatorOptions,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      stampChanged,
      isNameValid,
      isEditing,
      editStamp,
      onStartEdit
    }
  }
})
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
}
.form {
  margin-right: 12px;
}
</style>
