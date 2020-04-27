<template>
  <div :class="$style.container" :style="styles.container">
    <qall-control-panel
      :class="$style.control"
      status="通話中"
      channel-id="channelid"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import QallControlPanel from './QallControlPanel.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'NavigationContentQall',
  components: {
    QallControlPanel
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.control {
  flex: 0 1 64px;
}
</style>
