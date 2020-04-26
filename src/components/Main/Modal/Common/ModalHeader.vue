<template>
  <div :class="$style.container" :style="styles.container">
    <modal-return-button
      v-if="returnButton"
      :class="$style.returnButton"
      :style="styles.returnButton"
    />
    <div :class="$style.content">
      <h1 :class="$style.title" :style="styles.title">
        <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" />{{ title }}
      </h1>
      <h2 :class="$style.subtitle" :style="styles.subtitle">{{ subtitle }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import ModalReturnButton from './ModalReturnButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    })),
    title: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    subtitle: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    returnButton: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'CommonModalHeader',
  components: { Icon, ModalReturnButton },
  props: {
    iconMdi: { type: Boolean, default: false },
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    returnButton: { type: Boolean, default: false }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 16px;
  display: flex;
}
.content {
  display: inline;
}
.returnButton {
  padding-right: 4px;
  margin-left: -8px;
}
.title {
  display: flex;
  align-items: center;
  width: 100%;
  font: {
    weight: bold;
    size: 1.125rem;
  }
}
.subtitle {
  padding-left: 40px;
  font: {
    weight: 500;
    size: 0.875rem;
  }
}
.icon {
  margin-right: 16px;
}
</style>
