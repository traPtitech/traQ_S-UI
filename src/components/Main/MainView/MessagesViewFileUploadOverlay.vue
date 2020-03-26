<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.icon" :style="styles.icon">
      <icon mdi name="fileUpload" :size="72" />
    </span>
    <p>ドロップしてファイルをアップロード</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: transparentize(theme.background.primary, 0.8)
    })),
    icon: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MessagesViewFileUploadOverlay',
  components: { Icon },
  setup() {
    const styles = useStyles()
    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  font-weight: bold;
}

.icon {
  width: 120px;
  height: 120px;
  border-radius: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}
</style>
