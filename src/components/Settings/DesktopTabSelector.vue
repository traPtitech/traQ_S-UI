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
    <version :class="$style.version" />
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { navigations } from './use/navigation'
import DesktopTabSelectorItem from './DesktopTabSelectorItem.vue'
import Version from '/@/components/UI/Version.vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'DesktopTabSelector',
  components: { DesktopTabSelectorItem, Version },
  setup() {
    const route = useRoute()
    const currentRouteName = computed(() => route.name)
    return { currentRouteName, navigations }
  }
})
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
}
.header {
  margin: 40px 80px;
}
.version {
  margin-bottom: 16px;
  user-select: none;
}
</style>
