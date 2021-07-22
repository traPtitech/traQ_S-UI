<template>
  <router-link :to="path" :class="$style.item">
    <icon :name="iconName" :mdi="iconMdi" :size="size" />
    <span :class="$style.title">{{ title }}</span>
    <icon :class="$style.chevron" name="chevron-right" mdi :size="size" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { navigationRouteNameTitleMap } from './use/navigation'
import Icon from '/@/components/UI/Icon.vue'
import { constructSettingsPath, SettingsRouteName } from '/@/router/settings'

export default defineComponent({
  name: 'MobileTabSelectorItem',
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
    iconMdi: Boolean
  },
  setup(props) {
    const size = 24
    const title = computed(() => navigationRouteNameTitleMap[props.routeName])
    const path = computed(() => constructSettingsPath(props.routeName))
    return { size, title, path }
  }
})
</script>

<style lang="scss" module>
.item {
  @include color-ui-secondary;
  @include background-primary;
  display: flex;
  width: 100%;
  padding: 12px 40px;
  border-top: solid 2px;
  border-bottom: solid 2px;
  border-color: $theme-ui-tertiary;
  font-weight: bold;
  cursor: pointer;
}
.item + .item {
  border-top: none;
}

.title {
  flex: 1 0;
  margin: 0 16px;
  text-align: left;
}

.chevron {
  margin-right: 8px;
  vertical-align: bottom;
}
</style>
