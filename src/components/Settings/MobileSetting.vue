<template>
  <section :class="$style.container">
    <header :class="$style.header">
      <h2 v-if="isSettingsRoot" :class="[$style.title, $style.rootTitle]">
        設定
      </h2>
      <template v-else>
        <ReturnButton :size="40" @click="showRoot" />
        <TabContentTitle :class="$style.title" is-mobile />
      </template>
      <CloseButton :size="36" @close="close" />
    </header>
    <div v-show="isSettingsRoot" :class="$style.content">
      <MobileTabSelector />
    </div>
    <div v-show="!isSettingsRoot" :class="[$style.content, $style.tabContent]">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import CloseButton from '/@/components/UI/CloseButton.vue'
import ReturnButton from '/@/components/UI/ReturnButton.vue'
import { RouteName } from '/@/router'

import MobileTabSelector from './MobileTabSelector.vue'
import TabContentTitle from './TabContentTitle.vue'
import useSettingsNavigation from './composables/useNavigation'

const route = useRoute()
const isSettingsRoot = computed(() => route.name === RouteName.Settings)
const { showRoot, close } = useSettingsNavigation()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-secondary;
  display: grid;
  grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  min-height: 80px;
  padding: 20px 12px;
}

.title {
  flex: 1;
  min-width: 0;
}

.rootTitle {
  @include size-h2;
  padding-left: 30px;
}

.content {
  overflow: hidden auto;
}

.tabContent {
  @include background-primary;
  padding: 0 24px 24px;
}
</style>
