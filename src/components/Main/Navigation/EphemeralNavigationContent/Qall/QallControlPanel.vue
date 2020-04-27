<template>
  <div :class="$style.container" :style="styles.container">
    <button :class="$style.top"><icon name="phone" mdi /></button>
    <div :class="$style.info">
      <div :class="$style.status">
        {{ status }}
      </div>
      <router-link to="/channels/random" :class="$style.channelName">
        チャンネル名
      </router-link>
    </div>
    <button :class="$style.mic"><icon name="microphone" mdi /></button>
    <button :class="$style.end"><icon name="phone-hangup" mdi /></button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'QallControlPanel',
  components: {
    Icon
  },
  props: {
    status: {
      type: String,
      default: ''
    },
    channelId: {
      type: String,
      required: true
    }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'top info mic end' 1fr
    / 24px 1fr 24px 24px;
  column-gap: 12px;
  width: 100%;
  padding: 12px;
  align-items: center;
}
.top,
.mic,
.end {
  color: inherit;
  cursor: pointer;
}
.top {
  grid-area: top;
}
.info {
  grid-area: info;
  display: flex;
  flex-direction: column;
}
.mic {
  grid-area: mic;
}
.end {
  grid-area: end;
}
.status {
  font: {
    size: 0.875rem;
    weight: bold;
  }
  user-select: none;
}
.channelName {
  font-size: 0.75rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
