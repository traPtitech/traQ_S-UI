<template>
  <div :class="$style.container">
    <tool
      v-for="tool in tools"
      :key="tool.iconName"
      :class="$style.item"
      :icon-name="tool.iconName"
      :icon-mdi="tool.iconMdi"
      :disabled="tool.disabled"
      @mousedown="tool.onClick"
    />
    <user-icon
      :class="$style.item"
      :size="36"
      :user-id="myId"
      data-testid="my-icon-button"
    />
    <teleport v-if="isServicesShown" :to="`#${teleportTargetName}`">
      <app-list :class="$style.services" @close="closeServices" />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/store'
import Tool from '/@/components/Main/Navigation/Tool.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import useToolBox from '/@/components/Main/Navigation/use/toolBox'
import AppList from '/@/components/Main/Navigation/AppList.vue'

export const teleportTargetName = 'app-list'

export default defineComponent({
  name: 'DesktopToolBox',
  components: { Tool, UserIcon, AppList },
  setup() {
    const { tools, isServicesShown, closeServices, toggleServices } =
      useToolBox()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const myId = computed(() => store.getters.domain.me.myId!)

    return {
      tools,
      isServicesShown,
      closeServices,
      toggleServices,
      myId,
      teleportTargetName
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
