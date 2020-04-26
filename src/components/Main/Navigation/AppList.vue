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
        :label="app.label"
        :app-link="app.appLink"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import AppListItem from '@/components/Main/Navigation/AppListItem.vue'
import { makeStyles } from '@/lib/styles'
import CloseButton from '@/components/UI/CloseButton.vue'
import config from '@/config'

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
    const apps = config.services

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
