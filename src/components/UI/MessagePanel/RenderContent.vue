<template>
  <div
    :class="[$style.container, lineClampContent ? $style.lineClamp : '']"
    :style="styles.container"
  >
    <icon v-if="hasFile" :class="$style.icon" name="file" mdi :size="20" />
    <icon
      v-if="hasMessage"
      :class="$style.icon"
      name="comment-quote"
      mdi
      :size="20"
    />
    <span :class="$style.content" v-html="renderedContent" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { embeddingExtractor } from '@/lib/embeddingExtractor'
import { renderInline } from '@/lib/markdown'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'RenderContent',
  props: {
    content: {
      type: String,
      default: ''
    },
    lineClampContent: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.primary
      }))
    })

    const extracted = computed(() => embeddingExtractor(props.content))
    const hasFile = computed(() =>
      extracted.value.embeddings.some(e => e.type === 'file')
    )
    const hasMessage = computed(() =>
      extracted.value.embeddings.some(e => e.type === 'message')
    )
    const renderedContent = computed(() => renderInline(extracted.value.text))

    return { styles, hasFile, hasMessage, renderedContent }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  font-size: 1rem;
  word-break: break-all;
  width: 100%;
}
.lineClamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.icon {
  vertical-align: middle;
}
.content {
  text-size-adjust: 100%;
  line-height: 1.2;
  word-break: break-all;
}
.icon + .icon,
.icon + .content {
  margin-left: 4px;
}
</style>
