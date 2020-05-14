<template>
  <div :class="$style.container">
    <tool
      v-for="tool in tools"
      :key="tool.type"
      :class="$style.item"
      :icon-name="tool.iconName"
      :icon-mdi="tool.iconMdi"
      :disabled="tool.disabled"
      @click.native="tool.onClick"
    />
    <user-icon :class="$style.item" :size="36" :user-id="myId" />
    <portal v-if="isServicesShown" :to="targetPortalName">
      <app-list :class="$style.services" @close="closeServices" />
    </portal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import Tool from '@/components/Main/Navigation/Tool.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import useToolBox from '@/components/Main/Navigation/use/toolBox'
import AppList from '@/components/Main/Navigation/AppList.vue'

export const targetPortalName = 'app-list'

export default defineComponent({
  name: 'DesktopToolBox',
  components: { Tool, UserIcon, Icon, AppList },
  setup() {
    const {
      tools,
      isServicesShown,
      closeServices,
      toggleServices
    } = useToolBox()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const myId = computed(() => store.state.domain.me.detail!.id)

    return {
      tools,
      isServicesShown,
      closeServices,
      toggleServices,
      myId,
      targetPortalName
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
  max-width: min(calc(100vw - #{$header-width * 2}), 500px);
  z-index: $z-index-services;
}
</style>
