<template>
  <section :class="$style.container" :style="styles.container">
    <div :class="$style.header" :style="styles.header">
      <return-button @click="back" :size="40" />
      <tab-content-title
        :current-navigation="currentNavigation"
        :class="$style.title"
        is-mobile
      />
      <close-button @click="close" :size="56" />
    </div>
    <tab-content
      :class="$style.content"
      :current-navigation="currentNavigation"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { NavigationItemType } from './use/navigation'
import TabContentTitle from './TabContentTitle.vue'
import TabContent from './TabContent.vue'
import ReturnButton from '@/components/UI/ReturnButton.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    })),
    header: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MobileTabFrame',
  components: {
    TabContentTitle,
    TabContent,
    ReturnButton,
    CloseButton
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(_, context) {
    const styles = useStyles()

    const back = () => {
      context.emit('back')
    }

    const close = () => store.dispatch.ui.modal.clearModal()

    return { styles, back, close }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
  width: 100%;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.header {
  display: flex;
  padding: 20px;
  align-items: center;
}
.title {
  flex: 1;
}

.content {
  padding: 40px;
  padding-top: 0;
}
</style>
