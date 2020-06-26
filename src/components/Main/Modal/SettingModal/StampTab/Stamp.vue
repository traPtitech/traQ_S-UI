<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <img :src="url" :class="$style.stamp" />
    <div v-if="!isSelected" :class="$style.notSelected">
      <p>:{{ stamp.name }}:</p>
      <icon
        name="pencil"
        mdi
        :size="20"
        @click="onStartEdit"
        :class="$style.editIcon"
      />
    </div>
    <div v-else :class="$style.selected">
      <div :class="$style.forms">
        <form-input
          label="スタンプ名"
          prefix=":"
          suffix=":"
          v-model="nameState.new"
          :class="$style.form"
        />
        <form-selector
          label="所有者"
          :options="creatorOptions"
          v-model="creatorState.new"
          :class="$style.form"
        />
        <image-upload
          :class="$style.imageUpload"
          @input="onNewImgSet"
          :destroy-flag="imageUploadState.destroyFlag"
          @destroyed="onNewDestroyed"
        />
      </div>
      <form-button label="変更" :disabled="!stampChanged" @click="editStamp" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive
} from '@vue/composition-api'
import apis, { buildFilePath } from '@/lib/apis'
import store from '@/store'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { Stamp } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'
import { compareStringInsensitive } from '@/lib/util/string'
import { ActiveUserMap } from '@/store/entities'

const useName = (stamp: Stamp) => {
  const state = reactive({
    old: stamp.name,
    new: stamp.name,
    changed: computed((): boolean => state.old !== state.new)
  })
  const applyChange = () => {
    state.old = state.new
  }
  return { nameState: state, applyNameChange: applyChange }
}

const creatorOptions = computed(() =>
  Object.values(store.getters.entities.activeUsers as ActiveUserMap)
    .filter(u => !u.bot)
    .map(u => ({ key: u.name, value: u.id }))
    .sort((a, b) => compareStringInsensitive(a.key, b.key))
)

const useCreator = (stamp: Stamp) => {
  const state = reactive({
    old: stamp.creatorId,
    new: stamp.creatorId,
    changed: computed((): boolean => state.old !== state.new)
  })
  const applyChange = () => {
    state.old = state.new
  }
  return {
    creatorState: state,
    applyCreatorChange: applyChange,
    creatorOptions
  }
}

export default defineComponent({
  name: 'Stamp',
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
  setup(props, context) {
    const url = computed(() => buildFilePath(props.stamp.fileId))

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const { nameState, applyNameChange } = useName(props.stamp)
    const { creatorState, applyCreatorChange, creatorOptions } = useCreator(
      props.stamp
    )

    const stampChanged = computed(
      () =>
        nameState.changed ||
        creatorState.changed ||
        imageUploadState.imgData !== undefined
    )

    const onStartEdit = () => {
      context.emit('start-edit')
    }
    const onEndEdit = () => {
      context.emit('end-edit')
    }

    const editStamp = async () => {
      try {
        // TODO: loading
        const promises = []
        if (nameState.changed || creatorState.changed) {
          promises.push(
            apis.editStamp(props.stamp.id, {
              name: nameState.changed ? nameState.new : undefined,
              creatorId: creatorState.changed ? creatorState.new : undefined
            })
          )
        }
        if (imageUploadState.imgData !== undefined) {
          promises.push(
            apis.changeStampImage(props.stamp.id, imageUploadState.imgData)
          )
        }
        await Promise.all(promises)
        destroyImageUploadState()
        applyNameChange()
        applyCreatorChange()
        onEndEdit()

        store.commit.ui.toast.addToast({
          type: 'success',
          text: 'スタンプを更新しました'
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('スタンプの編集に失敗しました', e)

        store.commit.ui.toast.addToast({
          type: 'error',
          text: 'スタンプの編集に失敗しました'
        })
      }
    }

    return {
      url,
      nameState,
      creatorState,
      creatorOptions,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      stampChanged,
      editStamp,
      onStartEdit
    }
  },
  components: {
    FormInput,
    FormSelector,
    FormButton,
    ImageUpload,
    Icon
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
