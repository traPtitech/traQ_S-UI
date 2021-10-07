<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p>
      <icon name="home" mdi :class="$style.icon" />
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

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import ProfileHeader from './ProfileHeader.vue'
import Icon from '/@/components/UI/Icon.vue'
import useChannelPath from '/@/use/channelPath'
import { constructChannelPath } from '/@/router'
import { useOpenLinkAndClearModal } from '../../use/openLinkFromModal'

export default defineComponent({
  name: 'HomeChannel',
  components: {
    ProfileHeader,
    Icon
  },
  props: {
    id: { type: String as PropType<string | null>, default: undefined }
  },
  setup(props) {
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

    return {
      isLoading,
      isEmpty,
      channelPath,
      onClick
    }
  }
})
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
