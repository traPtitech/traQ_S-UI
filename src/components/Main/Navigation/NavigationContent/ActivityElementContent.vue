<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="['markdown-body', $style.content]" v-html="state.content" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

import { embeddingExtractor } from '@/lib/embeddingExtractor'
import MarkdownIt, { Store } from '@traptitech/traq-markdown-it'
import store from '@/store'
import useChannelPath from '@/use/channelPath'

const useRenderContent = (props: { content: string }) => {
  const { channelIdToPathString } = useChannelPath()
  const storeProvider: Store = {
    getUser(id) {
      return store.state.entities.users[id]
    },
    getChannel(id) {
      return store.state.entities.channels[id]
    },
    getChannelPath(id) {
      return channelIdToPathString(id)
    },
    getUserGroup(id) {
      return store.state.entities.userGroups[id]
    },
    getMe() {
      return store.state.entities.users[store.state.domain.me.detail?.id ?? '']
    },
    getStampByName(name) {
      return store.getters.entities.stampByName(name)
    },
    getUserByName(name) {
      return store.getters.entities.userByName(name)
    }
  }
  const md = new MarkdownIt(storeProvider)

  const state = reactive({
    content: computed(() => {
      const extracted = embeddingExtractor(props.content)
      const renderedContent = md.renderInline(extracted.text)
      return renderedContent
    })
  })

  return state
}

export default defineComponent({
  name: 'ActivityElementContent',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.primary
      }))
    })

    const state = useRenderContent(props)

    return {
      styles,
      state
    }
  }
})
</script>

<style lang="scss" module>
.container {
  font-size: 1rem;
  word-break: break-all;
  width: 100%;
}
.content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
