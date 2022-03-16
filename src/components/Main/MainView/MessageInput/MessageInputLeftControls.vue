<template>
  <div :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    <template v-if="!isMobile || isExpanded">
      <message-input-upload-button
        :class="$style.button"
        @click="onClickAddAttachment"
      />
      <message-input-preview-button
        v-model="isPreviewShownValue"
        :class="$style.button"
      />
    </template>
    <icon-button
      v-if="isMobile"
      :class="$style.button"
      :icon-name="isExpanded ? 'chevron-left' : 'chevron-right'"
      icon-mdi
      @click="toggleExpanded"
    />
  </div>
</template>

<script lang="ts" setup>
import MessageInputUploadButton from './MessageInputUploadButton.vue';
import MessageInputPreviewButton from './MessageInputPreviewButton.vue';
import IconButton from '/@/components/UI/IconButton.vue';
import { computed } from 'vue';
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = defineProps<{
    isExpanded: boolean,
    isPreviewShown: boolean
}>();

const emit = defineEmits<{
    (e: "update:isExpanded", _v: boolean): void,
    (e: "update:isPreviewShown", _v: boolean): void,
    (e: "clickAddAttachment"): void
}>();

const { isMobile } = useResponsiveStore()
const toggleExpanded = () => {
  emit('update:isExpanded', !props.isExpanded)
}

const isPreviewShownValue = computed<boolean>({
  get() {
    return props.isPreviewShown
  },
  set(v) {
    emit('update:isPreviewShown', v)
    emit('update:isExpanded', false)
  }
})

const onClickAddAttachment = () => {
  emit('clickAddAttachment')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
}
.button {
  margin: 0 4px;

  &:first-child:first-child {
    margin-left: 0;
  }
  &:last-child:last-child {
    margin-right: 0;
  }
}
</style>
