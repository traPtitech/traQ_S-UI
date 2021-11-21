<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <a-icon :class="$style.icon" mdi :name="iconName" />
    <span>{{ folderName }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'ClipFolderElement',
  components: {
    AIcon
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
    @include color-accent-primary;
  }
}
</style>
