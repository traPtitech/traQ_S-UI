<template>
  <div :class="$style.circle" :style="styles.icon">
    <icon
      :class="$style.icon"
      :name="name"
      :mdi="mdi"
      :size="size"
      :color="color"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

const useStyles = (props: { background: string }) => {
  return reactive({
    icon: computed(() => ({
      background: props.background
    }))
  })
}

export default defineComponent({
  name: 'CircleIcon',
  components: { Icon },
  props: {
    color: {
      type: String,
      required: true
    },
    background: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    mdi: Boolean,
    size: {
      type: Number,
      default: 24
    }
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  }
})
</script>

<style lang="scss" module>
.circle {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon {
  padding: 16%;
}
</style>
