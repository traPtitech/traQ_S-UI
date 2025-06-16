<template>
  <router-link :to="path" :class="$style.item" :aria-selected="isSelected">
    <a-icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    {{ title }}
  </router-link>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import { navigationRouteNameTitleMap } from './composables/useNavigation'
import type { SettingsRouteName } from '/@/router/settings'
import { constructSettingsPath } from '/@/router/settings'

const props = defineProps<{
  routeName: SettingsRouteName
  iconName: string
  iconMdi?: boolean
  isSelected: boolean
}>()

const title = computed(() => navigationRouteNameTitleMap[props.routeName])
const path = computed(() => constructSettingsPath(props.routeName))
</script>

<style lang="scss" module>
.item {
  @include color-ui-secondary;
  display: block;
  width: 100%;
  padding: 20px 5% 20px 25%;
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
