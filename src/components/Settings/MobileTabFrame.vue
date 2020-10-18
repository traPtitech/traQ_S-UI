<template>
  <section :class="$style.container">
    <div :class="$style.header">
      <return-button @click="back" :size="40" />
      <tab-content-title :class="$style.title" is-mobile />
      <close-button @close="close" :size="36" />
    </div>
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { NavigationItemType } from './use/navigation'
import TabContentTitle from './TabContentTitle.vue'
import ReturnButton from '@/components/UI/ReturnButton.vue'
import CloseButton from '@/components/UI/CloseButton.vue'
import useSettingsNavigation from './use/settingsNavigation'

export default defineComponent({
  name: 'MobileTabFrame',
  components: {
    TabContentTitle,
    ReturnButton,
    CloseButton
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(_, context) {
    const { close, back } = useSettingsNavigation()
    return { back, close }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  height: 100%;
  width: 100%;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.header {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  padding: 20px;
  align-items: center;
}
.title {
  flex: 1;
}

.content {
  padding: 40px;
  padding-top: 0;
}
</style>
