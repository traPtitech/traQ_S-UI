<template>
  <button :class="$style.item" :aria-selected="isSelected">
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    {{ title }}
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import { NavigationItemType, navigationTypeNameMap } from './use/navigation'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'DesktopTabSelectorItem',
  components: { Icon },
  props: {
    type: {
      type: String as PropType<NavigationItemType>,
      required: true
    },
    iconName: {
      type: String,
      required: true
    },
    iconMdi: Boolean,
    isSelected: {
      type: Boolean,
      required: true
    }
  },
  setup(props, context) {
    const title = computed(() => navigationTypeNameMap[props.type])
    return { title, context }
  }
})
</script>

<style lang="scss" module>
.item {
  @include color-ui-secondary;
  display: block;
  width: 100%;
  padding: 20px 60px 20px 80px;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
  &[aria-selected='true'] {
    @include color-ui-primary;
    @include background-tertiary;
  }
}

.icon {
  margin-right: 8px;
  vertical-align: bottom;
}
</style>
