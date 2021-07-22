<template>
  <router-link :to="path" :class="$style.item" :aria-selected="isSelected">
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    {{ title }}
  </router-link>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { navigationRouteNameTitleMap } from './use/navigation'
import Icon from '/@/components/UI/Icon.vue'
import { constructSettingsPath, SettingsRouteName } from '/@/router/settings'

export default defineComponent({
  name: 'DesktopTabSelectorItem',
  components: { Icon },
  props: {
    routeName: {
      type: String as PropType<SettingsRouteName>,
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
  setup(props) {
    const title = computed(() => navigationRouteNameTitleMap[props.routeName])
    const path = computed(() => constructSettingsPath(props.routeName))
    return { title, path }
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
