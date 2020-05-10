<template>
  <div :class="[$style.container, lineClampContent ? $style.lineClamp : '']">
    <file-type-icon
      v-for="fileType in fileTypes"
      :key="fileType"
      :class="$style.icon"
      :type="fileType"
      :size="20"
    />
    <icon
      v-if="hasMessage"
      :class="$style.icon"
      name="comment-quote"
      mdi
      :size="20"
    />
    <span
      :class="[$style.content, 'markdown-inline-body']"
      v-html="renderedContent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from '@vue/composition-api'
import { embeddingReplacer } from '@/lib/embeddingExtractor'
import { renderInline } from '@/lib/markdown'
import store from '@/store'
import { mimeToFileType } from '@/lib/util/file'
import Icon from '@/components/UI/Icon.vue'
import FileTypeIcon from '@/components/UI/FileTypeIcon.vue'

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
    const extracted = computed(() => embeddingReplacer(props.content))
    const files = computed(() =>
      extracted.value.embeddings.filter(e => e.type === 'file')
    )

    watchEffect(() => {
      files.value.forEach(file =>
        store.dispatch.entities.fetchFileMetaByFileId(file.id)
      )
    })

    const fileTypes = computed(() => [
      ...new Set(
        files.value.map(file => {
          const mime = store.state.entities.fileMetaData[file.id]?.mime
          return mime ? mimeToFileType(mime) : 'file'
        })
      )
    ])
    const hasMessage = computed(() =>
      extracted.value.embeddings.some(e => e.type === 'message')
    )
    const renderedContent = computed(() => renderInline(extracted.value.text))

    return { fileTypes, hasMessage, renderedContent }
  },
  components: {
    FileTypeIcon,
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-body1;
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
