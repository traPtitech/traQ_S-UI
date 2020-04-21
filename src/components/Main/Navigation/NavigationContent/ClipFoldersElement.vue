<template>
  <div :class="$style.container" :style="styles.container">
    <icon name="bookmark" mdi :class="$style.icon" />
    {{ clipFolder.name }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { ClipFolder } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ClipFoldersElement',
  components: {
    Icon
  },
  props: {
    clipFolder: {
      type: Object as PropType<ClipFolder>,
      required: true
    }
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
  padding: 2px;
  cursor: pointer;
  font-size: 18px;
}
.icon {
  margin-right: 16px;
}
</style>
