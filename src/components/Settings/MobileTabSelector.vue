<template>
  <section :class="$style.container">
    <div>
      <div :class="$style.header">
        <h2 :class="$style.title">設定</h2>
        <close-button :size="36" @close="close" />
      </div>
      <mobile-tab-selector-item
        v-for="navigation in navigations"
        :key="navigation.routeName"
        :route-name="navigation.routeName"
        :icon-name="navigation.iconName"
        :icon-mdi="navigation.iconMdi"
        :is-selected="currentRouteName === navigation.routeName"
      />
      <safari-warning :class="$style.safariWarning" />
    </div>
    <version-info :class="$style.version" />
  </section>
</template>

<script lang="ts" setup>
import CloseButton from '/@/components/UI/CloseButton.vue';
import VersionInfo from '/@/components/UI/VersionInfo.vue';
import MobileTabSelectorItem from './MobileTabSelectorItem.vue';
import SafariWarning from './SafariWarning.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router'
import useSettingsNavigation, { navigations } from './composables/useNavigation'

const route = useRoute()
const currentRouteName = computed(() => route.name)
const { close } = useSettingsNavigation()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  display: flex;
  padding: 20px 12px;
  align-items: center;
}
.title {
  @include size-h2;
  display: flex;
  align-items: center;
  padding-left: 30px;
  height: 40px;
  flex: 1 0;
}

.safariWarning {
  margin: 40px 20px;
}
.version {
  margin-bottom: 16px;
}
</style>
