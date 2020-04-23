<template>
  <router-link
    :to="fileLink"
    :class="$style.container"
    :style="styles.container"
  >
    <div :class="$style.icon">
      <icon mdi :name="fileIconName" :size="32" />
    </div>
    <div :class="$style.fileName">
      <span :class="$style.fileNameInner">
        {{ fileMeta.name }}
      </span>
    </div>
    <span :class="$style.fileSize" :style="styles.fileSize">{{
      fileSize
    }}</span>
    <div :href="fileRawPath" :class="$style.dl">
      <icon mdi name="download" :size="32" />
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useFileMeta from '@/use/fileMeta'

const useStyles = (props: { isWhite: boolean }) =>
  reactive({
    container: makeStyles((theme, common) => ({
      borderColor: theme.ui.secondary,
      color: props.isWhite ? common.text.whitePrimary : theme.ui.primary
    })),
    fileSize: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whiteSecondary : theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessageFileListItemContent',
  components: { Icon },
  props: {
    fileId: {
      type: String,
      default: ''
    },
    isWhite: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const {
      fileMeta,
      fileSize,
      fileIconName,
      fileRawPath,
      fileLink
    } = useFileMeta(props, context)
    return { styles, fileMeta, fileSize, fileIconName, fileRawPath, fileLink }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  width: 100%;
  grid-template:
    'icon ... name ... dl' 20px
    'icon ... size ... dl' 16px
    / 36px 16px auto 1fr 24px;
  gap: 4px 0;
  padding: 12px 16px;
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
  display: flex;
  align-items: center;
  grid-area: name;
  overflow: hidden;
}
// flexに直接text-overflow: ellipsisをつけるとバグるため
.fileNameInner {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fileSize {
  grid-area: size;
  display: flex;
  align-items: center;
}
</style>
