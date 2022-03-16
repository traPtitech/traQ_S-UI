<template>
  <h2 :class="$style.container">
    {{ title }}
  </h2>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import {
  NavigationItemType,
  navigationTypeNameMap
} from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

const props = withDefaults(defineProps<{
    currentNavigation?: NavigationItemType
}>(), {
    currentNavigation: 'home' as const
});

const title = computed(() => navigationTypeNameMap[props.currentNavigation])
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-h2;
  font-weight: bold;
}
</style>
