<template>
  <div :class="$style.container" :style="styles.container">
    <markdown-inline-content :class="$style.content" :content="content" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import MarkdownInlineContent from '@/components/UI/MarkdownInlineContent.vue'

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

    return { styles }
  },
  components: {
    MarkdownInlineContent
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
