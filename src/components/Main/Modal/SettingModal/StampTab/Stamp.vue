<template>
  <div :class="$style.container" :style="styles.container">
    <img :src="url" :class="$style.stamp" />
    <span>:{{ stamp.name }}:</span>
    <image-upload
      v-if="isSelected"
      @input="onNewImgSet"
      :destroy-flag="newDestroyFlag"
      @destroyed="onNewDestroyed"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import apis, { buildFilePath, Stamp } from '@/lib/api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { isSelected: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.isSelected
        ? theme.background.secondary
        : theme.background.primary
    }))
  })

export default defineComponent({
  name: 'Stamp',
  props: {
    stamp: {
      type: Object as PropType<Stamp>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = useStyles(props)
    const url = computed(() => buildFilePath(props.stamp.fileId))

    return { styles, url }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}

.stamp {
  height: 40px;
  width: 40px;
}
</style>
