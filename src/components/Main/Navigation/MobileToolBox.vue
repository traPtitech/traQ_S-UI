<template>
  <div :class="$style.container">
    <tool
      v-for="tool in tools"
      :key="tool.iconName"
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

<script lang="ts">
import { defineComponent } from 'vue'
import Tool from '/@/components/Main/Navigation/Tool.vue'
import useToolBox from '/@/components/Main/Navigation/use/toolBox'
import AppList from '/@/components/Main/Navigation/AppList.vue'

export default defineComponent({
  name: 'MobileToolBox',
  components: { Tool, AppList },
  setup() {
    const { tools, isServicesShown, closeServices } = useToolBox()

    return {
      tools,
      isServicesShown,
      closeServices
    }
  }
})
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
