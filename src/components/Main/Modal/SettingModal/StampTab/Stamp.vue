<template>
  <div :class="$style.container" :style="styles.container">
    <img :src="url" :class="$style.stamp" />
    <span v-if="!isSelected">:{{ stamp.name }}:</span>
    <template v-else>
      <form-input prefix=":" suffix=":" v-model="nameState.newName" />
      <form-input label="所有者" prefix="@" v-model="creatorState.newName" />
      <image-upload
        :class="$style.imageUpload"
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
      />
      <form-button label="変更" :disabled="!stampChanged" @click="editStamp" />
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive
} from '@vue/composition-api'
import apis, { buildFilePath, Stamp } from '@/lib/api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'

const useStyles = (props: { isSelected: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.isSelected
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
  setup(props) {
    const styles = useStyles(props)
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

    return {
      styles,
      url,
      nameState,
      creatorState,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      stampChanged,
      editStamp
    }
  },
  components: {
    FormInput,
    FormButton,
    ImageUpload
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  flex-flow: row wrap;
}

.stamp {
  height: 40px;
  width: 40px;
}
</style>
