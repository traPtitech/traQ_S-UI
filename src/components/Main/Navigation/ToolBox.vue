<template>
  <div :class="$style.container">
    <div v-for="item in items" :key="item.type" :class="$style.item">
      <tool
        :icon-name="item.iconName"
        :icon-mdi="item.iconMdi"
        :disabled="item.disabled"
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
  openAppsModal,
  toggleNotification,
  toggleTheme,
  openSettingsModal
} from '@/components/Main/Navigation/use/tool'

export default defineComponent({
  name: 'ToolBox',
  components: { Tool, UserIcon, Icon },
  setup() {
    const themeIcon = computed(() => {
      switch (store.state.app.themeSettings.type) {
        case 'light':
          return 'crescent-outline'
        case 'dark':
          return 'crescent' // なんかリアクティブになってない気がする
        case 'custom':
          return 'brightness-6'
        default:
          const invalid: never = store.state.app.themeSettings.type
          // eslint-disable-next-line no-console
          console.warn(`Invalid theme type: ${invalid}`)

          return 'crescent'
      }
    })

    const isMdi = computed(() => {
      if (store.state.app.themeSettings.type === 'custom') {
        return true
      }
      return
    })

    const isDisabled = computed(
      () => store.state.app.themeSettings.type === 'custom'
    )

    const items = computed(
      (): Array<{
        iconName: string
        iconMdi?: true
        disabled?: boolean
        onClick: () => void
      }> => [
        // Apps
        {
          iconName: 'apps',
          iconMdi: true,
          onClick: openAppsModal
        },
        // notification
        {
          iconName: 'bell',
          iconMdi: true,
          onClick: toggleNotification
        },
        // theme
        {
          iconName: themeIcon.value,
          iconMdi: isMdi.value,
          disabled: isDisabled.value,
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
