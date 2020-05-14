<template>
  <div>
    <div :class="$style.container">
      <div :class="$style.searchBar"></div>
      <tool
        v-for="tool in tools"
        :key="tool.type"
        :icon-name="tool.iconName"
        :icon-mdi="tool.iconMdi"
        :disabled="tool.disabled"
        @click.native="tool.onClick"
      />
    </div>
    <portal v-if="isServicesShown" :to="targetPortalName">
      <app-list :class="$style.services" @close="closeServices" />
    </portal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Tool from '@/components/Main/Navigation/Tool.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import useToolBox from '@/components/Main/Navigation/use/toolBox'
import AppList from '@/components/Main/Navigation/AppList.vue'

export const targetPortalName = 'app-list'

export default defineComponent({
  name: 'MobileToolBox',
  components: { Tool, UserIcon, Icon, AppList },
  setup() {
    const {
      tools,
      isServicesShown,
      closeServices,
      toggleServices
    } = useToolBox()

    return {
      tools,
      isServicesShown,
      closeServices,
      toggleServices,
      targetPortalName
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
