<template>
  <div :class="[$style.container, lineClampContent ? $style.lineClamp : '']">
    <file-type-icon
      v-for="[fileType, isAnimatedImage] in fileTypes"
      :key="fileType"
      :class="$style.icon"
      :type="fileType"
      :size="20"
      :is-animated-image="isAnimatedImage"
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
import { defineComponent, computed, watchEffect, ref } from 'vue'
import { renderInline } from '@/lib/markdown/markdown'
import store from '@/store'
import { AttachmentType, mimeToFileType } from '@/lib/util/file'
import Icon from '@/components/UI/Icon.vue'
import FileTypeIcon from '@/components/UI/FileTypeIcon.vue'
import { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { isFile } from '@/lib/util/guard/embeddingOrUrl'

const getUniqueFileTypes = (fileTypes: Array<[AttachmentType, boolean]>) => {
  const res: Array<[AttachmentType, boolean]> = []

  const set = new Set<string>()
  const getKey = (fileType: [AttachmentType, boolean]) =>
    `${fileType[0]}${fileType[1]}`

  for (const fileType of fileTypes) {
    const key = getKey(fileType)
    if (set.has(key)) continue

    set.add(key)
    res.push(fileType)
  }
  return res
}

export default defineComponent({
  name: 'RenderContent',
  components: {
    FileTypeIcon,
    Icon
  },
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
    const rendered = ref<MarkdownRenderResult>()
    watchEffect(async () => {
      rendered.value = await renderInline(props.content)
    })

    const files = computed(
      () => rendered.value?.embeddings.filter(isFile) ?? []
    )

    watchEffect(() => {
      files.value.forEach(file =>
        store.dispatch.entities.messages.fetchFileMetaData({ fileId: file.id })
      )
    })

    const fileTypes = computed(() =>
      getUniqueFileTypes(
        files.value.map(file => {
          const meta = store.state.entities.messages.fileMetaDataMap.get(
            file.id
          )
          return [
            meta ? mimeToFileType(meta.mime) : 'file',
            meta?.isAnimatedImage ?? false
          ]
        })
      )
    )
    const hasMessage = computed(() =>
      rendered.value?.embeddings.some(e => e.type === 'message')
    )
    const renderedContent = computed(() => rendered.value?.renderedText)

    return { fileTypes, hasMessage, renderedContent }
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
  overflow: clip;
}

.icon {
  vertical-align: middle;
}
.content {
  text-size-adjust: 100%;
  line-height: 1.2;
  word-break: break-all;
  a {
    pointer-events: none;
  }
}
.icon + .icon,
.icon + .content {
  margin-left: 4px;
}
</style>
