<template>
  <a
    :class="$style.link"
    :style="styles.container"
    :href="appLink"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div :class="$style.container">
      <icon
        :class="$style.icon"
        :name="iconName"
        :mdi="iconMdi"
        :width="32"
        :height="32"
      />
      <span :class="$style.label">{{ label }}</span>
    </div>
  </a>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'AppListItem',
  components: {
    Icon
  },
  props: {
    iconName: { type: String, required: true },
    iconMdi: { type: Boolean, default: false },
    label: { type: String, default: '' },
    appLink: { type: String, default: '' }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.link {
  margin: 16px;
  padding: 16px;
  border-radius: 8px;
  flex: 1 0;
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.label {
  font: {
    size: 1rem;
  }
}
</style>
