<template>
  <div :class="$style.container">
    <div v-for="item in items" :key="item.type" :class="$style.item">
      <tool
        :icon-mdi="item.iconMdi"
        :icon-name="item.iconName"
        @click.native="item.onClick"
      />
    </div>
    <div :class="$style.item">
      <user-icon :size="44" :user-id="myId" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import Tool from '@/components/Main/Navigation/Tool.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import {
  openServices,
  toggleNotification,
  toggleTheme,
  openSettingsModal
} from '@/components/Main/Navigation/use/tool'

export default defineComponent({
  name: 'ToolBox',
  components: { Tool, UserIcon, Icon },
  setup() {
    const items = computed(
      (): Array<{
        iconName: string
        iconMdi?: true
        onClick: () => void
      }> => [
        // services
        {
          iconName: 'apps',
          iconMdi: true,
          onClick: openServices
        },
        // notification
        {
          iconName: 'bell',
          iconMdi: true,
          onClick: toggleNotification
        },
        // theme
        {
          iconName:
            store.state.app.themeSettings.type === 'dark'
              ? 'filled-crescent'
              : 'void-crescent',
          onClick: toggleTheme
        },
        // settings
        {
          iconName: 'cog',
          iconMdi: true,
          onClick: openSettingsModal
        }
      ]
    )
    const myId = computed(() => store.state.domain.me.detail!.id)

    return { items, myId }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}
.item {
  margin: 8px 0;
}
</style>
