<template>
  <router-link :to="path" :class="$style.item">
    <a-icon :name="iconName" :mdi="iconMdi" :size="size" />
    <span :class="$style.title">{{ title }}</span>
    <a-icon :class="$style.chevron" name="chevron-right" mdi :size="size" />
  </router-link>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';
import { navigationRouteNameTitleMap } from './composables/useNavigation'
import { constructSettingsPath, SettingsRouteName } from '/@/router/settings'

const props = defineProps<{
    routeName: SettingsRouteName,
    iconName: string,
    iconMdi?: boolean
}>();

const size = 24
const title = computed(() => navigationRouteNameTitleMap[props.routeName])
const path = computed(() => constructSettingsPath(props.routeName))
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
  border-color: $theme-ui-tertiary-default;
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
