<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.icon">
      <icon mdi :name="fileIconName" :size="32" />
    </div>
    <div :class="$style.fileName">
      {{ fileMeta.name }}
    </div>
    <div :class="$style.fileSize" :style="styles.fileSize">
      {{ fileSize }}
    </div>
    <div :class="$style.dl">
      <icon mdi name="download" :size="32" />
    </div>
    <button :class="$style.close" @click="onClickClear">X</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { isWhite: boolean }) =>
  reactive({
    container: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whitePrimary : theme.ui.primary
    })),
    fileSize: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whiteSecondary : theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'FileModalItemContentHeader',
  components: {
    Icon
  },
  props: {
    fileId: {
      type: String,
      required: true
    },
    isWhite: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { fileMeta, fileIconName, fileSize } = useFileMeta(props, context)
    const onClickClear = () => store.dispatch.ui.modal.clearModal()
    return { styles, fileMeta, fileIconName, fileSize, onClickClear }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  width: 100%;
  grid-template:
    'icon ...  name ... dl ... close' 20px
    'icon ...  size ... dl ... close' 16px
    /36px 16px auto 1fr 24px 16px 36px;
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
  grid-area: name;
  display: flex;
  align-items: center;
}
.fileSize {
  grid-area: size;
  display: flex;
  align-items: center;
}
.close {
  grid-area: close;
  background-color: white;
  cursor: pointer;
}
</style>
