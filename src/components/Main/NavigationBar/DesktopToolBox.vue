<template>
  <div :class="$style.container">
    <tool-item
      v-for="tool in tools"
      :key="tool.iconName"
      :class="$style.item"
      :icon-name="tool.iconName"
      :icon-mdi="tool.iconMdi"
      @mousedown.middle="tool.onClick"
      @click="tool.onClick"
    />
    <user-icon
      v-if="myId"
      :class="$style.item"
      :size="36"
      :user-id="myId"
      data-testid="my-icon-button"
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
import ToolItem from '/@/components/Main/NavigationBar/ToolItem.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useToolBox from '/@/components/Main/NavigationBar/composables/useToolBox'
import AppList from '/@/components/Main/NavigationBar/AppList.vue'
import { useMeStore } from '/@/store/domain/me'

export default defineComponent({
  name: 'DesktopToolBox',
  components: { ToolItem, UserIcon, AppList },
  setup() {
    const { myId } = useMeStore()
    const { tools, isServicesShown, closeServices } = useToolBox()

    return {
      tools,
      isServicesShown,
      closeServices,
      myId
    }
  }
})
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
