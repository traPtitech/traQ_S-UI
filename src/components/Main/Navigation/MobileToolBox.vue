<template>
  <div>
    <div :class="$style.container">
      <div :class="$style.searchBar"></div>
      <tool
        v-for="tool in tools"
        :key="tool.iconName"
        :icon-name="tool.iconName"
        :icon-mdi="tool.iconMdi"
        :disabled="tool.disabled"
        @mousedown.middle="tool.onClick"
        @click="tool.onClick"
      />
    </div>
    <teleport v-if="isServicesShown" :to="`#${teleportTargetName}`">
      <app-list :class="$style.services" @close="closeServices" />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tool from '/@/components/Main/Navigation/Tool.vue'
import useToolBox from '/@/components/Main/Navigation/use/toolBox'
import AppList from '/@/components/Main/Navigation/AppList.vue'

export const teleportTargetName = 'app-list'

export default defineComponent({
  name: 'MobileToolBox',
  components: { Tool, AppList },
  setup() {
    const { tools, isServicesShown, closeServices, toggleServices } =
      useToolBox()

    return {
      tools,
      isServicesShown,
      closeServices,
      toggleServices,
      teleportTargetName
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.searchBar {
  flex: 1 1;
}
.userIcon {
  cursor: pointer;
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
