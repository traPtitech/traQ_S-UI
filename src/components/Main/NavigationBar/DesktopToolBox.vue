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
import { defineComponent, computed } from 'vue'
import store from '/@/vuex'
import ToolItem from '/@/components/Main/NavigationBar/ToolItem.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useToolBox from '/@/components/Main/NavigationBar/use/toolBox'
import AppList from '/@/components/Main/NavigationBar/AppList.vue'

export default defineComponent({
  name: 'DesktopToolBox',
  components: { ToolItem, UserIcon, AppList },
  setup() {
    const { tools, isServicesShown, closeServices } = useToolBox()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const myId = computed(() => store.getters.domain.me.myId!)

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
