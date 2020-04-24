<template>
  <div>
    <span>サービス</span>
      <app-list-frame>
        <div v-for="app in apps" :key="app.appName" :class="$style.container">
          <app-list-item
            :icon-name="app.iconName"
            :icon-mdi="app.iconMdi"
            :label="app.label"
            :app-link="app.appLink"
          />
        </div>
      </app-list-frame>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import AppListItem from '@/components/Main/Navigation/AppListItem.vue'
import AppListFrame from '@/components/Main/Navigation/AppListFrame.vue'

export default defineComponent({
  name: 'AppList',
  components: { AppListItem, AppListFrame },
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
          iconName: 'traQ',
          appLink: 'https://trap.jp'
        },
        {
          label: 'Wiki',
          iconName: 'growi',
          appLink: 'https://wiki.trap.jp'
        },
        {
          label: 'Blog',
          iconName: 'ghost',
          appLink: 'https://blog.trap.jp'
        },
        {
          label: 'Drive',
          iconName: 'next-cloud',
          appLink: 'https://drive.trap.jp'
        },
        {
          label: 'Git',
          iconName: 'gitea',
          appLink: 'https://git.trap.jp'
        },
        {
          label: 'Showcase',
          iconName: 'showcase',
          appLink: 'https://showcase.trap'
        },
        {
          label: 'HackMD',
          iconName: 'hack-md',
          appLink: 'https://md.trap.jp'
        },
        {
          label: 'anke-to',
          iconName: 'anke-to',
          appLink: 'https://anke-to.trap.jp'
        },
        {
          label: 'booQ',
          iconName: 'booq',
          appLink: 'https://booq.trap.jp'
        },
        {
          label: 'BOT Console',
          iconName: 'bot-console',
          appLink: 'https://bot-console.trap.jp'
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
  padding: 16px;
  border-radius: 4px;
}
</style>
