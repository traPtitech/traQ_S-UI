<template>
  <router-link
    :to="fileLink"
    :class="$style.container"
    :style="styles.container"
  >
    <div :class="$style.innerContainer">
      <div :class="$style.icon">
        <icon mdi :name="fileIconName" :size="32" />
      </div>
      <span :class="$style.fileName" :style="styles.fileName">
        {{ fileName }}
      </span>
      <span :class="$style.fileSize" :style="styles.fileSize">{{
        prettifiedFileSize
      }}</span>
    </div>
    <div :class="$style.dl">
      <icon mdi name="download" :size="32" />
    </div>
  </router-link>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive,
  onBeforeMount
} from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'
import { AttachmentType } from '@/lib/util/file'
import { makeStyles } from '@/lib/styles'
import { prettifyFileSize } from '@/lib/util/file'
import Icon from '@/components/UI/Icon.vue'
import useFileLink from './use/fileLink'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      borderColor: theme.ui.secondary
    })),
    fileName: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    fileSize: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListItem',
  components: { Icon },
  props: {
    fileId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    fileType: {
      type: String as PropType<AttachmentType>,
      default: 'file' as AttachmentType
    }
  },
  setup(props) {
    const styles = useStyles()
    const prettifiedFileSize = computed(() => prettifyFileSize(props.fileSize))
    const fileIconName = computed(() =>
      props.fileType === 'file' ? 'file' : `file-${props.fileType}`
    )
    const { fileLink } = useFileLink(props)
    return { styles, prettifiedFileSize, fileLink, fileIconName }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  max-width: 400px;
  border: {
    style: solid;
    width: 2px;
    radius: 4px;
  }
  overflow: hidden;
  padding: 16px;
  cursor: pointer;
}
.innerContainer {
  display: grid;
  width: 100%;
  grid-template:
    'icon ...  name ... dl' 20px
    'icon ...  size ... dl' 16px
    /36px 16px auto 1fr 24px;
  gap: 4px 0;
}
.icon,
.dl {
  display: flex;
  align-items: center;
  height: 40px;
}
.icon {
  grid-area: icon;
}
.dl {
  grid-area: dl;
}
.fileName {
  grid-area: name;
  display: flex;
  align-items: center;
}
.fileSize {
  grid-area: size;
  display: flex;
  align-items: center;
}
</style>
