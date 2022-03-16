<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p>
      <a-icon name="home" mdi :class="$style.icon" />
      <span v-if="isLoading" :class="$style.text" aria-busy="true">
        [Now loading...]
      </span>
      <span v-else-if="isEmpty" :class="$style.text" data-is-empty>
        [未設定]
      </span>
      <span v-else :class="[$style.text, $style.channel]" @mousedown="onClick">
        #{{ channelPath }}
      </span>
    </p>
  </section>
</template>

<script lang="ts" setup>
import ProfileHeader from './ProfileHeader.vue';
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';
import useChannelPath from '/@/composables/useChannelPath'
import { constructChannelPath } from '/@/router'
import { useOpenLinkAndClearModal } from '../../composables/useOpenLinkFromModal'

const props = defineProps<{
    id?: string | null
}>();

const { openLinkAndClearModal } = useOpenLinkAndClearModal()
const isLoading = computed(() => props.id === undefined)
const isEmpty = computed(() =>
  props.id === undefined ? false : props.id === null
)

const { channelIdToPathString } = useChannelPath()
const channelPath = computed(() =>
  props.id ? channelIdToPathString(props.id) : ''
)

const onClick = async (event: MouseEvent) => {
  if (!props.id) return

  openLinkAndClearModal(event, constructChannelPath(channelPath.value))
}
</script>

<style lang="scss" module>
.icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}

.channel {
  cursor: pointer;
}

.text {
  @include color-ui-primary;
  &[aria-busy='true'],
  &[data-is-empty] {
    @include color-ui-tertiary;
  }
}
</style>
