<template>
  <div
    @click="$emit('click')"
    :class="$style.container"
    :style="styles.container"
  >
    <icon :class="$style.icon" :style="styles.icon" mdi :name="iconName" />
    <span>{{ folderName }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { isSelected: boolean }) =>
  reactive({
    container: makeStyles(theme => ({ color: theme.ui.primary })),
    icon: makeStyles(theme => ({
      color: props.isSelected ? theme.accent.primary : theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ClipFolderElement',
  components: {
    Icon
  },
  props: {
    folderName: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = useStyles(props)
    const iconName = computed(() =>
      props.isSelected ? 'bookmark-check' : 'bookmark'
    )
    return { styles, iconName }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}
.icon {
  margin-right: 8px;
}
</style>
