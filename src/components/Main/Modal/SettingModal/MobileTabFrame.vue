<template>
  <section :class="$style.container" :style="styles.container">
    <tab-content-title
      :current-navigation="currentNavigation"
      :class="$style.title"
    />
    <button @click="back">back</button>
    <div :class="$style.close">
      <close-button @click="close" :size="56" />
    </div>
    <tab-content :current-navigation="currentNavigation" />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { NavigationItemType } from './use/navigation'
import TabContentTitle from './TabContentTitle.vue'
import TabContent from './TabContent.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'MobileTabFrame',
  components: {
    TabContentTitle,
    TabContent,
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
  flex: 1 1;
  padding: 40px;
  padding-right: 240px;
  overflow: {
    x: hidden;
    y: auto;
  }
}

.title {
  margin-bottom: 40px;
}
</style>
