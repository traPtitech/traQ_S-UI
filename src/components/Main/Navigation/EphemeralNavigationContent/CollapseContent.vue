<template>
  <div :class="$style.container">
    <div
      :class="$style.expandButton"
      :data-is-expanded="$boolAttr(isExpanded)"
      @click="toggleExpanded"
    >
      <icon :class="$style.expandIcon" name="chevron-up" mdi />
    </div>
    <div :class="$style.list" :data-is-expanded="$boolAttr(isExpanded)">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

const useExpanded = () => {
  const isExpanded = ref(false)
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
  }
  return { isExpanded, toggleExpanded }
}

export default defineComponent({
  name: 'CollapseContent',
  components: {
    Icon
  },
  setup() {
    const { isExpanded, toggleExpanded } = useExpanded()

    return { isExpanded, toggleExpanded }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  flex: 1 1;
  min-height: 0;
}
.expandButton {
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.expandIcon {
  transform: rotate(0);
  transition: transform 0.5s;
  .expandButton[data-is-expanded] & {
    transform: rotate(0.5turn);
  }
}
.list {
  padding: 0 12px 8px 12px;
  max-height: 120px;
  overflow: scroll;
  transition: 0.5s max-height ease-out;
  &[data-is-expanded] {
    max-height: 600px;
  }
}
</style>
