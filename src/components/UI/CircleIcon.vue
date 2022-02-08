<template>
  <div :class="$style.circle" :style="styles.icon">
    <a-icon :class="$style.icon" :name="name" :mdi="mdi" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const useStyles = (props: { color: string; background: string }) => {
  return reactive({
    icon: computed(() => ({
      color: props.color,
      background: props.background
    }))
  })
}

export default defineComponent({
  name: 'CircleIcon',
  components: { AIcon },
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
