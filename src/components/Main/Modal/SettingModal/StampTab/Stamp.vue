<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <img :src="url" :class="$style.stamp" />
    <div v-if="!isSelected" :class="$style.notSelected">
      <p>:{{ stamp.name }}:</p>
      <icon
        name="pencil"
        mdi
        :size="20"
        @click="onStartEdit"
        v-if="hoverState.hover"
      />
    </div>
    <div v-else :class="$style.selected">
      <div :class="$style.forms">
        <form-input
          label="スタンプ名"
          prefix=":"
          suffix=":"
          v-model="nameState.newName"
          :class="$style.form"
        />
        <form-input
          label="所有者"
          prefix="@"
          v-model="creatorState.newName"
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
  reactive,
  SetupContext
} from '@vue/composition-api'
import apis, { buildFilePath } from '@/lib/apis'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { Stamp } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'
import useHover from '@/use/hover'

const useStyles = (
  props: { isSelected: boolean },
  hoverState: { hover: boolean }
) =>
  reactive({
    container: makeStyles(theme => ({
      background:
        !props.isSelected && hoverState.hover
          ? theme.background.tertiary
          : theme.background.primary
    }))
  })

const useName = (stamp: Stamp) => {
  const state = reactive({
    newName: stamp.name,
    changed: computed((): boolean => stamp.name !== state.newName)
  })
  return state
}

const useCreator = (stamp: Stamp) => {
  const name = computed(
    () => store.state.entities.users[stamp.creatorId]?.name ?? ''
  )
  const state = reactive({
    newName: name.value,
    newId: computed(
      (): string | undefined =>
        store.getters.entities.userByName(state.newName)?.id
    ),
    changed: computed((): boolean => name.value !== state.newName)
  })
  return state
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
  setup(props, context: SetupContext) {
    const { hoverState, onMouseEnter, onMouseLeave } = useHover(context)
    const styles = useStyles(props, hoverState)
    const url = computed(() => buildFilePath(props.stamp.fileId))

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const nameState = useName(props.stamp)
    const creatorState = useCreator(props.stamp)

    const stampChanged = computed(
      () =>
        nameState.changed ||
        creatorState.changed ||
        imageUploadState.imgData !== undefined
    )

    const editStamp = async () => {
      try {
        // TODO: loading

        // TODO: 選択をもっとやりやすくする
        if (!creatorState.newId) {
          // TODO: 存在しなかったエラー
          return
        }

        const promises = []
        if (nameState.changed || creatorState.changed) {
          promises.push(
            apis.editStamp(props.stamp.id, {
              name: nameState.newName,
              creatorId: creatorState.newId
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
      } catch (e) {
        // TODO: error
      }
    }

    const onStartEdit = () => {
      context.emit('start-edit')
    }

    return {
      styles,
      url,
      nameState,
      creatorState,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      stampChanged,
      editStamp,
      onStartEdit,
      hoverState,
      onMouseEnter,
      onMouseLeave
    }
  },
  components: {
    FormInput,
    FormButton,
    ImageUpload,
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  padding: {
    left: 12px;
    top: 12px;
    bottom: 12px;
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
