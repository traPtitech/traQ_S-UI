<template>
  <section :class="$style.container">
    <tab-content-title
      :current-navigation="currentNavigation"
      :class="$style.title"
    />
    <tab-content
      :current-navigation="currentNavigation"
      may-show-safari-warning
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { NavigationItemType } from './use/navigation'
import TabContentTitle from './TabContentTitle.vue'
import TabContent from './TabContent.vue'

export default defineComponent({
  name: 'DesktopTabFrame',
  components: {
    TabContentTitle,
    TabContent
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  flex: 1 1;
  padding: 40px;
  padding-right: 240px;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.title {
  margin-bottom: 40px;
}
</style>
