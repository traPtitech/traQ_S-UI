<template>
  <div :class="$style.container">
    <ToolItem
      v-for="tool in tools"
      :key="tool.iconName"
      :class="$style.item"
      :icon-name="tool.iconName"
      :icon-mdi="tool.iconMdi"
      @mousedown.middle="tool.onClick"
      @click="tool.onClick"
    />
    <UserIcon
      v-if="myId"
      :class="$style.item"
      :size="36"
      :user-id="myId"
      data-testid="my-icon-button"
    />
    <AppList
      v-if="isServicesShown"
      :class="$style.services"
      @close="closeServices"
    />
  </div>
</template>

<script lang="ts" setup>
import AppList from '/@/components/Main/NavigationBar/AppList.vue'
import ToolItem from '/@/components/Main/NavigationBar/ToolItem.vue'
import useToolBox from '/@/components/Main/NavigationBar/composables/useToolBox'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useMeStore } from '/@/store/domain/me'

const { myId } = useMeStore()
const { tools, isServicesShown, closeServices } = useToolBox()
</script>

<style lang="scss" module>
$header-width: 64px;

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}
.item {
  margin: 8px 0;
}
.services {
  position: fixed;
  bottom: $header-width;
  left: $header-width;
  width: min(calc(100vw - #{$header-width * 2}), 500px);
  max-height: calc(100vh - #{$header-width * 2});
  z-index: $z-index-services;
}
</style>
