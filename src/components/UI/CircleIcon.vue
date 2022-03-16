<template>
  <div :class="$style.circle" :style="styles.icon">
    <a-icon :class="$style.icon" :name="name" :mdi="mdi" :size="size" />
  </div>
</template>

<script lang="ts">
import { reactive, computed } from 'vue';

const useStyles = (props: { color: string; background: string }) => {
  return reactive({
    icon: computed(() => ({
      color: props.color,
      background: props.background
    }))
  })
}
</script>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';

const props = withDefaults(defineProps<{
    color: string,
    background: string,
    name: string,
    mdi?: boolean,
    size?: number
}>(), {
    size: 24
});

const styles = useStyles(props)
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
