<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <icon :class="$style.icon" mdi :name="iconName" />
    <span>{{ folderName }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

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
    const iconName = computed(() =>
      props.isSelected ? 'bookmark-check' : 'bookmark'
    )
    return { iconName }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}
.icon {
  @include color-ui-primary;
  margin-right: 8px;
  .container[aria-selected='true'] & {
    color: $theme-accent-primary;
  }
}
</style>
