<template>
  <div
    :class="$style.container"
    :style="styles.container"
    v-click-outside="onClickOutside"
  >
    <common-modal-header
      :class="$style.header"
      :icon-name="iconName"
      :icon-mdi="iconMdi"
      :title="title"
      :subtitle="subtitle"
    />
    <div :class="$style.body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import CommonModalHeader from './ModalHeader.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'ModalFrame',
  components: {
    CommonModalHeader
  },
  props: {
    iconMdi: { type: Boolean, default: false },
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' }
  },
  setup() {
    const styles = useStyles()
    const onClickOutside = () => store.dispatch.ui.modal.clearModal()
    return { styles, onClickOutside }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-flow: column nowrap;
  max-height: 480px;
  max-width: 440px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: {
    style: solid;
    width: 2px;
  }
}
.header {
  flex-shrink: 0;
}
.body {
  width: 100%;
  padding: 16px 24px;
  overflow: {
    x: hidden;
    y: auto;
  }
}
</style>
