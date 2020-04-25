<template>
  <div :class="$style.container" :style="styles.container">
    <span :class="$style.title">サービス</span>
    <app-list-item
      v-for="app in apps"
      :key="app.appName"
      :class="$style.item"
      :icon-name="app.iconName"
      :icon-mdi="app.iconMdi"
      :label="app.label"
      :app-link="app.appLink"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api'
import AppListItem from '@/components/Main/Navigation/AppListItem.vue'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles((theme, common) => ({
      filter: common.dropShadow.default,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'AppList',
  components: { AppListItem },
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
          appLink: 'https://blog-admin.trap.jp'
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
          appLink: 'https://showcase.trapti.tech'
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

    const styles = useStyles()

    return { apps, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-flow: row wrap;
  padding: 16px;
  border-radius: 8px;
}
.item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
}
.title {
  margin-bottom: 40px;
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
