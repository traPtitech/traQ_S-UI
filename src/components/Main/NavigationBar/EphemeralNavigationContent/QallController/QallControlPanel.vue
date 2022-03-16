<template>
  <div :class="$style.container">
    <button :class="$style.top" @click="topToggleClick">
      <a-icon name="phone" mdi />
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
      @click="micClick"
    >
      <a-icon :name="micIconName" mdi />
    </button>
    <button :class="$style.end" @click="endQallClick">
      <a-icon name="phone-hangup" mdi />
    </button>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';
import useChannelPath from '/@/composables/useChannelPath'

const props = withDefaults(defineProps<{
    status?: string,
    channelId: string,
    isMicMuted?: boolean
}>(), {
    status: '',
    isMicMuted: false
});

const emit = defineEmits<{
    (e: "topToggleClick"): void,
    (e: "micClick"): void,
    (e: "endQallClick"): void
}>();

const { channelIdToShortPathString, channelIdToLink } = useChannelPath()
const channelName = computed(() =>
  channelIdToShortPathString(props.channelId)
)
const channelLink = computed(() => channelIdToLink(props.channelId))

const micIconName = computed(() =>
  props.isMicMuted ? 'microphone-off' : 'microphone'
)

const topToggleClick = () => {
  emit('topToggleClick')
}
const micClick = () => {
  emit('micClick')
}
const endQallClick = () => {
  emit('endQallClick')
}
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
    color: $theme-background-secondary-border;
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
