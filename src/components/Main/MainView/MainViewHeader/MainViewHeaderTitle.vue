<template>
  <div :class="$style.container" :style="styles.container">
    <icon
      :class="$style.icon"
      v-if="iconName"
      :name="iconName"
      :mdi="iconMdi"
    />
    <h1 :class="$style.title">{{ title }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'MainViewHeaderTitle',
  components: { Icon },
  props: {
    iconMdi: {
      type: Boolean,
      defualt: false
    },
    iconName: String,
    title: { type: String, required: true }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
}

.title {
  @include font-size-tremendous-large;
}
</style>
