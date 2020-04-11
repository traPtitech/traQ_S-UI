<template>
  <section :class="$style.section">
    <h3 :class="$style.title" :style="styles.title">
      {{ title }}
    </h3>
    <p
      v-if="description"
      :class="$style.description"
      :style="styles.description"
    >
      {{ description }}
    </p>
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    title: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    description: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ModalSection',
  props: {
    title: { type: String, required: true },
    description: String
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.section {
  // slotの外からスタイルを当てられないため
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.title {
  font: {
    size: 1rem;
    weight: bold;
  }
}
.description {
  margin-top: 4px;
  font: {
    size: 0.875rem;
    weight: normal;
  }
}
</style>
