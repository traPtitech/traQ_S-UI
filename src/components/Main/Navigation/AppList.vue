<template>
  <app-list-frame>
    <span>サービス</span>
    <div v-for="app in apps" :key="app.appName" :class="$style.container">
      <app-list-item
        :icon-name="app.iconName"
        :icon-mdi="app.iconMdi"
        :label="app.label"
        :app-link="app.appLink"
      />
    </div>
  </app-list-frame>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import AppListItem from '@/components/Main/Navigation/AppListItem.vue'
import AppListFrame from '@/components/Main/Navigation/AppListFrame.vue'


export default defineComponent({
  name: 'AppList',
  components: { AppListItem, AppListFrame, CloseButton },
  setup() {
    const apps = computed(
      (): Array<{
        label: string
        appLink: string
        iconName: string
        iconMdi?: true
      }> => [
        {
          label: 'Portal',
          iconName: 'portal',
          appLink: 'https://portal.trap.jp'
        },
        {
          label: 'Official Website',
          iconName: 'trap',
          appLink: 'https://trap.jp'
        },
        {
          label: 'Blog',
          iconName: 'ghost',
          appLink: 'https://blog.trap.jp'
        }
      ]
    )

    return { apps }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 16px;
  border-radius: 4px;
}
</style>
