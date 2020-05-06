<template>
  <div :class="$style.container">
    <message-input-file-list-item-close-button
      :class="$style.closeButton"
      @click="onClickClose"
    />
    <message-input-file-list-item-image
      v-if="state.showThumbnail"
      :attachment="attachment"
    />
    <div v-else :class="$style.fileContainer">
      <icon mdi :name="iconName" />
      <div :class="$style.fileName">{{ attachment.file.name }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { Attachment } from '@/store/ui/fileInput/state'
import Icon from '@/components/UI/Icon.vue'
import MessageInputFileListItemImage from './MessageInputFileListItemImage.vue'
import MessageInputFileListItemCloseButton from './MessageInputFileListItemCloseButton.vue'

interface Props {
  attachment: Attachment
}

const useFileTypeIcon = (props: Props) => {
  const iconName = computed(() => {
    switch (props.attachment.type) {
      case 'file':
        return 'file'
      case 'image':
        return 'file-image'
      case 'video':
        return 'file-video'
      case 'audio':
        return 'file-music'
    }
  })
  return {
    iconName
  }
}

export default defineComponent({
  name: 'MessageInputFileListItem',
  components: {
    Icon,
    MessageInputFileListItemImage,
    MessageInputFileListItemCloseButton
  },
  props: {
    attachment: {
      type: Object as PropType<Attachment>,
      required: true
    }
  },
  setup(props, context) {
    const state = reactive({
      showThumbnail: computed((): boolean =>
        props.attachment.type === 'image' && props.attachment.thumbnailDataUrl
          ? props.attachment.thumbnailDataUrl.length > 0
          : false
      )
    })
    const { iconName } = useFileTypeIcon(props)
    const onClickClose = () => context.emit('item-remove')
    return {
      state,
      iconName,
      onClickClose
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
}
.closeButton {
  position: absolute;
  right: 4px;
  top: 4px;
}
.fileContainer {
  @include background-primary;
  max-width: 128px;
  min-width: 80px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  border-radius: 4px;
}
.fileName {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
</style>
