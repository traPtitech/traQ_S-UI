<template>
  <header :class="$style.container" :style="styles.container">
    <h2>
      <main-view-header-channel-name :channel-id="props.channelId" />
    </h2>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MainViewHeaderChannelName from './MainViewHeaderChannelName.vue'

type Props = {
  channelId: ChannelId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    }))
  })

export default defineComponent({
  name: 'MainViewHeader',
  components: {
    MainViewHeaderChannelName
  },
  props: { channelId: String },
  setup(props: Props) {
    const state = reactive({
      channels: computed(() => store.state.entities.channels)
    })
    const styles = useStyles()
    return { props, state, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}
</style>
