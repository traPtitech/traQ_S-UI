<template>
  <section :class="$style.container">
    <div>
      <h2 :class="$style.header">設定</h2>
      <DesktopTabSelectorItem
        v-for="navigation in navigations"
        :key="navigation.routeName"
        :route-name="navigation.routeName"
        :icon-name="navigation.iconName"
        :icon-mdi="navigation.iconMdi"
        :is-selected="currentRouteName === navigation.routeName"
      />
    </div>
    <VersionInfo :class="$style.version" />
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import VersionInfo from '/@/components/UI/VersionInfo.vue'

import DesktopTabSelectorItem from './DesktopTabSelectorItem.vue'
import { navigations } from './composables/useNavigation'

const route = useRoute()
const currentRouteName = computed(() => route.name)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
.header {
  margin: 40px 25%;
}
.version {
  margin-bottom: 16px;
  user-select: none;
}
</style>
