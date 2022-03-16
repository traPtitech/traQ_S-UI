<template>
  <section :class="$style.container">
    <div :class="$style.header">
      <return-button :size="40" @click="showRoot" />
      <tab-content-title :class="$style.title" is-mobile />
      <close-button :size="36" @close="close" />
    </div>
    <div :class="$style.content">
      <slot />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useSettingsNavigation from './composables/useNavigation'
import TabContentTitle from './TabContentTitle.vue'
import ReturnButton from '/@/components/UI/ReturnButton.vue'
import CloseButton from '/@/components/UI/CloseButton.vue'

export default defineComponent({
  name: 'MobileTabFrame',
  components: {
    TabContentTitle,
    ReturnButton,
    CloseButton
  },
  setup() {
    const { close, showRoot } = useSettingsNavigation()
    return { showRoot, close }
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
  scrollbar-gutter: stable;
}

.header {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  padding: 20px 12px;
  align-items: center;
}
.title {
  flex: 1;
}

.content {
  padding: 24px;
  padding-top: 0;
  overflow-y: scroll;

  // ヘッダー分の80px抜いた高さ
  height: calc(100vh - 80px);
}
</style>
