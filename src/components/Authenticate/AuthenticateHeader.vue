<template>
  <div :class="$style.container" :style="styles.container">
    <span v-if="props.title" :class="$style.logoWithTitle">
      <img src="/img/traq-logo.svg" :class="$style.logo" />
      <span :class="$style.title">{{ props.title }}</span>
    </span>
    <img v-else src="/img/traq-logo-full.svg" :class="$style.fullLogo" />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import useInput from '@/use/input'
import { makeStyles } from '@/lib/styles'

type Props = {
  title?: string
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    logoMain: makeStyles(theme => ({
      fill: theme.accent.primary
    })),
    logoType: makeStyles(theme => ({
      fill: theme.accent.primary
    }))
  })

export default defineComponent({
  name: 'AuthenticateHeader',
  props: {
    title: String
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 48px;
}
.logo {
  height: 40px;
  width: auto;
}
.fullLogo {
  height: 48px;
  width: auto;
  margin: 0 auto;
}
.logoWithTitle {
  display: flex;
  align-items: center;
  height: 48px;
  width: auto;
  font-weight: bold;
}
.title {
  margin-left: 16px;
}
</style>
