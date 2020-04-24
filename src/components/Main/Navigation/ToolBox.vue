<template>
  <div>
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
    <portal v-if="isPopupMenuShown" :to="targetPortalName">
      <app-list :class="$style.toolsMenu" v-click-outside="closePopupMenu" />
    </portal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import Tool from '@/components/Main/Navigation/Tool.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import {
  toggleNotification,
  toggleTheme,
  openSettingsModal
} from '@/components/Main/Navigation/use/tool'
import usePopupMenu from '@/components/Main/Navigation/use/popupMenu'
import AppList from '@/components/Main/Navigation/AppList.vue'

export const targetPortalName = 'app-list'

export default defineComponent({
  name: 'ToolBox',
  components: { Tool, UserIcon, Icon, AppList },
  setup() {
    const { isPopupMenuShown, closePopupMenu, togglePopupMenu } = usePopupMenu()

    const themeIcon = computed(() => {
      switch (store.state.app.themeSettings.type) {
        case 'light':
          return 'crescent-outline'
        case 'dark':
          return 'crescent'
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
          onClick: togglePopupMenu
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

    return {
      items,
      myId,
      targetPortalName,
      isPopupMenuShown,
      closePopupMenu,
      togglePopupMenu
    }
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
.toolsMenu {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
}
</style>
