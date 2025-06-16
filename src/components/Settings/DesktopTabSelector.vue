<template>
  <section :class="$style.container">
    <div>
      <h2 :class="$style.header">設定</h2>
      <desktop-tab-selector-item
        v-for="navigation in navigations"
        :key="navigation.routeName"
        :route-name="navigation.routeName"
        :icon-name="navigation.iconName"
        :icon-mdi="navigation.iconMdi"
        :is-selected="currentRouteName === navigation.routeName"
      />
    </div>
    <version-info :class="$style.version" />
  </section>
</template>

<script lang="ts" setup>
import DesktopTabSelectorItem from './DesktopTabSelectorItem.vue'
import VersionInfo from '/@/components/UI/VersionInfo.vue'
import { computed } from 'vue'
import { navigations } from './composables/useNavigation'
import { useRoute } from 'vue-router'

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
