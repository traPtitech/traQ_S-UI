<template>
  <div :class="$style.container">
    <tool-item
      v-for="tool in tools"
      :key="tool.iconName"
      :tool-name="tool.toolName"
      :icon-name="tool.iconName"
      :icon-mdi="tool.iconMdi"
      @mousedown.middle="tool.onClick"
      @click="tool.onClick"
    />
    <app-list
      v-if="isServicesShown"
      :class="$style.services"
      @close="closeServices"
    />
  </div>
</template>

<script lang="ts" setup>
import ToolItem from '/@/components/Main/NavigationBar/ToolItem.vue'
import AppList from '/@/components/Main/NavigationBar/AppList.vue'
import useToolBox from '/@/components/Main/NavigationBar/composables/useToolBox'

const { tools, isServicesShown, closeServices } = useToolBox()
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

$margin: 16px;
.services {
  position: fixed;
  top: $margin;
  left: $margin;
  right: $margin;
  bottom: $margin;
  margin: auto;
  height: min-content;
  max-height: calc(100% - #{$margin * 2});
  z-index: $z-index-services;
}
</style>
