<template>
  <div :class="$style.container">
    <button :class="$style.top" @click="$emit('topToggleClick')">
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
      :class="$style.mic"
      :data-is-mute="$boolAttr(isMicMuted)"
      @click="$emit('micClick')"
    >
      <icon :name="micIconName" mdi />
    </button>
    <button :class="$style.end" @click="$emit('endQallClick')">
      <icon name="phone-hangup" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import useChannelPath from '/@/use/channelPath'
import { constructChannelPath } from '/@/router'

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
    const { channelIdToShortPathString, channelIdToPathString } =
      useChannelPath()
    const channelName = computed(() =>
      channelIdToShortPathString(props.channelId)
    )
    const channelLink = computed(() =>
      constructChannelPath(channelIdToPathString(props.channelId))
    )

    const micIconName = computed(() =>
      props.isMicMuted ? 'microphone-off' : 'microphone'
    )
    return { channelName, channelLink, micIconName }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
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
    color: $theme-background-secondary;
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
  @include color-ui-secondary;
  grid-area: mic;
  &[data-is-mute] {
    color: $common-ui-muted;
  }
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
