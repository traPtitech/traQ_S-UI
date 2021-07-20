<template>
  <div :class="$style.container">
    <span :class="$style.description">
      <router-link :to="channelLink">
        {{ channelPath }}
      </router-link>
      - {{ date }}
    </span>
    <router-link :class="$style.link" :to="`/messages/${message.id}`">
      メッセージへ
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Message } from '@traptitech/traq'
import useChannelPath from '/@/use/channelPath'
import { getCreatedDate } from '/@/lib/date'

export default defineComponent({
  name: 'MessageQuoteListItemFooter',
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToPathString, channelIdToLink } = useChannelPath()

    const channelPath = computed(() =>
      props.message ? channelIdToPathString(props.message.channelId, true) : ''
    )
    const channelLink = computed(() =>
      props.message ? channelIdToLink(props.message.channelId) : ''
    )
    const date = computed(() =>
      props.message ? getCreatedDate(props.message.createdAt) : ''
    )

    return { channelPath, channelLink, date }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  padding-left: 8px;
  align-self: end;
  word-break: keep-all;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  min-width: 0;
}
.description {
  font-weight: normal;
  margin-right: 8px;
}
.link {
  font-weight: bold;
}
</style>
