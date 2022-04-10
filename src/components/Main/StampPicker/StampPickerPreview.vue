<template>
  <div :class="$style.container">
    <div :class="$style.wrapper">
      <markdown-content :content="rendered" />
    </div>
    <div :class="$style.previewText">
      {{ previewText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { StampId } from '/@/types/entity-ids'
import { useStampsStore } from '/@/store/entities/stamps'
import type { AnimeEffect, SizeEffect } from '@traptitech/traq-markdown-it'
import { computed, ref, watchEffect } from 'vue'
import type { Stamp } from '@traptitech/traq'
import { constructStampString } from '/@/lib/markdown/constructStampString'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import { render } from '/@/lib/markdown/markdown'

const props = defineProps<{
  stampId: StampId | undefined
  sizeEffect: SizeEffect | undefined
  animeEffects: AnimeEffect[]
}>()

const { stampsMap } = useStampsStore()
const stampName = computed(() => {
  if (!props.stampId) {
    return (
      (stampsMap.value.values().next().value as Stamp | undefined)?.name ??
      'missing'
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return stampsMap.value.get(props.stampId)!.name
})

const previewText = computed(() =>
  constructStampString(stampName.value, props.sizeEffect, props.animeEffects)
)

const rendered = ref('')
watchEffect(async () => {
  rendered.value = (await render(previewText.value)).renderedText
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  padding: 4px;
}

.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  margin: 4px;
  flex-shrink: 0;
  overflow: hidden;
}

.previewText {
  @include color-ui-primary;
  white-space: nowrap;
  overflow-x: auto;
}
</style>
