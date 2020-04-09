<template>
  <div :class="$style.container" :style="styles.container">
    <icon
      :height="28"
      :width="28"
      mdi
      name="chevron-left"
      @click="closePinned"
      :class="$style.revertButton"
    />
    <span :class="$style.pinnedHeaderText">ピン留め</span>
    <close-button
      :class="$style.closeButton"
      :size="28"
      :backgroundColor="'secondary'"
      @click="closeBar"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import CloseButton from '@/components/Main/Modal/SettingModal/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'PinnedSideBarHeader',
  components: { Icon, CloseButton },
  setup(_, context: SetupContext) {
    const closePinned = () => {
      context.emit('closePinned')
    }
    const closeBar = () => {
      context.emit('closeBar')
    }
    const styles = useStyles()
    return { styles, closeBar, closePinned }
  }
})
</script>

<style lang="scss" module>
$headerTextSize: 1.5rem;

.container {
  display: flex;
  width: 256px;
  align-items: center;
  flex-shrink: 0;
}

.pinnedHeaderText {
  font-size: $headerTextSize;
  font-weight: bold;
  margin-left: 16px;
}

.closeButton {
  margin-left: auto;
}

.revertButton {
  cursor: pointer;
}
</style>
