<template>
  <div :class="$style.container" :style="styles.container">
    <button @click="$emit('top-toggle-click')" :class="$style.top">
      <icon name="phone" mdi />
    </button>
    <div :class="$style.info">
      <div :class="$style.status">
        {{ status }}
      </div>
      <router-link :to="channelLink" :class="$style.channelName">
        #{{ channelName }}
      </router-link>
    </div>
    <button
      @click="$emit('mic-click')"
      :class="$style.mic"
      :style="styles.micIcon"
    >
      <icon :name="micIconName" mdi />
    </button>
    <button @click="$emit('end-qall-click')" :class="$style.end">
      <icon name="phone-hangup" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useChannelPath from '@/use/channelPath'
import { constructChannelPath } from '@/router'

const useStyles = (props: { isMicMuted: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary,
      borderColor: theme.background.secondary
    })),
    micIcon: makeStyles((theme, common) => ({
      color: props.isMicMuted ? common.ui.muted : theme.ui.secondary
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
    },
    isMicMuted: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = useStyles(props)
    const { channelIdToShortPathString } = useChannelPath()
    const channelName = computed(() =>
      channelIdToShortPathString(props.channelId)
    )
    const channelLink = computed(() => constructChannelPath(channelName.value))
    const micIconName = computed(() =>
      props.isMicMuted ? 'microphone-off' : 'microphone'
    )
    return { styles, channelName, channelLink, micIconName }
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
  border-top: {
    style: solid;
    width: 2px;
  }
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
  min-width: 0;
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
  @include size-caption;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
