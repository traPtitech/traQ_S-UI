<template>
  <header :class="$style.container" :style="styles.container">
    <div :class="$style.headerContainer">
      <button
        :class="$style.navigationButton"
        :style="styles.navigationButton"
        v-if="isMobile"
        @click="openNav"
      >
        <icon name="traQ" />
      </button>
      <h2>
        <slot name="header" />
      </h2>
    </div>
    <slot name="tools" />
  </header>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useIsMobile from '@/use/isMobile'
import useNavigationController from '@/use/navigationController'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    })),
    navigationButton: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'MainViewHeader',
  components: {
    Icon
  },
  setup(props, context) {
    const styles = useStyles()
    const { isMobile } = useIsMobile()
    const { openNav } = useNavigationController()
    return {
      styles,
      isMobile,
      openNav
    }
  }
})
</script>

<style lang="scss" module>
$headerHeight: 80px;

.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $headerHeight;
  width: 100%;
  flex: 0 0 $headerHeight;
  padding: 16px;
}
.headerContainer {
  display: flex;
}
.navigationButton {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
</style>
