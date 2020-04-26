<template>
  <div
    :class="$style.container"
    :style="styles.container"
    v-click-outside="close"
  >
    <div :class="$style.header">
      <span :class="$style.title">サービス</span>
      <close-button
        :class="$style.close"
        :size="20"
        :border-width="2"
        @click="close"
      />
    </div>
    <div :class="$style.list">
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api'
import AppListItem from '@/components/Main/Navigation/AppListItem.vue'
import { makeStyles } from '@/lib/styles'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles((theme, common) => ({
      filter: common.dropShadow.default,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'AppList',
  components: { AppListItem, CloseButton },
  setup(_, context) {
    const apps = computed(
      (): Array<{
        label: string
        appLink: string
        iconName: string
        iconMdi?: true
      }> => [
        {
          label: 'Portal',
          iconName: 'services/portal',
          appLink: 'https://portal.trap.jp/'
        },
        {
          label: 'Official Website',
          iconName: 'services/traP',
          appLink: 'https://trap.jp/'
        },
        {
          label: 'Wiki',
          iconName: 'services/growi',
          appLink: 'https://wiki.trap.jp/'
        },
        {
          label: 'Blog',
          iconName: 'services/ghost',
          appLink: 'https://blog-admin.trap.jp/'
        },
        {
          label: 'Drive',
          iconName: 'services/nextcloud',
          appLink: 'https://drive.trap.jp/'
        },
        {
          label: 'Git',
          iconName: 'services/gitea',
          appLink: 'https://git.trap.jp/'
        },
        {
          label: 'Showcase',
          iconName: 'services/showcase',
          appLink: 'https://showcase.trapti.tech/'
        },
        {
          label: 'HackMD',
          iconName: 'services/hackmd',
          appLink: 'https://md.trap.jp/'
        },
        {
          label: 'anke-to',
          iconName: 'services/anke-to',
          appLink: 'https://anke-to.trap.jp/'
        },
        {
          label: 'booQ',
          iconName: 'services/booq',
          appLink: 'https://booq.trap.jp/'
        },
        {
          label: 'BOT Console',
          iconName: 'services/bot-console',
          appLink: 'https://bot-console.trap.jp/'
        }
      ]
    )

    const close = () => {
      context.emit('close')
    }

    const styles = useStyles()

    return { apps, styles, close }
  }
})
</script>

<style lang="scss" module>
$header-width: 64px;

.container {
  position: fixed;
  bottom: $header-width;
  left: $header-width;
  max-width: min(calc(100vw - #{$header-width * 2}), 500px);
  padding: 16px;
  border-radius: 8px;
  z-index: 999;
}

.header {
  display: flex;
  flex-direction: row;
}

.title {
  font-weight: bold;
}

.close {
  margin-left: auto;
}

.list {
  display: flex;
  flex-flow: row wrap;
}
</style>
