<template>
  <div :class="$style.outerContainer" :style="outerContainerStyle">
    <icon-button
      v-if="showTextAreaExpandButton"
      :class="$style.textAreaExpandButton"
      :icon-name="isInputTextAreaExpanded ? 'chevron-down' : 'chevron-up'"
      icon-mdi
      @click="toggleIsInputTextAreaExpanded"
    />
    <div :class="$style.innerContainer" :data-is-mobile="$boolAttr(isMobile)">
      <template v-if="!isMobile || isLeftControlsExpanded">
        <message-input-upload-button
          :class="$style.button"
          @click="emit('clickAddAttachment')"
        />
        <message-input-preview-button
          v-model="isPreviewShownValue"
          :class="$style.button"
        />
      </template>
      <icon-button
        v-if="isMobile"
        :class="$style.button"
        :icon-name="isLeftControlsExpanded ? 'chevron-left' : 'chevron-right'"
        icon-mdi
        @click="toggleLeftControlsExpanded"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import MessageInputPreviewButton from './MessageInputPreviewButton.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = defineProps<{
  isLeftControlsExpanded: boolean
  isPreviewShown: boolean
  isInputTextAreaExpanded: boolean
  showTextAreaExpandButton: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isLeftControlsExpanded', _v: boolean): void
  (e: 'update:isPreviewShown', _v: boolean): void
  (e: 'clickAddAttachment'): void
  (e: 'update:isInputTextAreaExpanded', _v: boolean): void
  (e: 'toggleLeftControlsExpanded'): void
}>()

const { isMobile } = useResponsiveStore()
const toggleLeftControlsExpanded = () => {
  emit('update:isLeftControlsExpanded', !props.isLeftControlsExpanded)
  emit('toggleLeftControlsExpanded')
}
const toggleIsInputTextAreaExpanded = () => {
  emit('update:isInputTextAreaExpanded', !props.isInputTextAreaExpanded)
}

const isPreviewShownValue = computed<boolean>({
  get() {
    return props.isPreviewShown
  },
  set(v) {
    emit('update:isPreviewShown', v)
    emit('update:isLeftControlsExpanded', false)
    emit('toggleLeftControlsExpanded')
  }
})

const outerContainerStyle = computed(() => ({
  '--justify-content': props.showTextAreaExpandButton
    ? 'space-between'
    : 'flex-end'
}))
</script>

<style lang="scss" module>
.outerContainer {
  @include color-ui-secondary;
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: var(--justify-content);
}
.innerContainer {
  @include color-ui-secondary;
  display: flex;
}
.button {
  @include color-ui-secondary;
  margin: 0 4px;

  &:first-child:first-child {
    margin-left: 0;
  }
  &:last-child:last-child {
    margin-right: 0;
  }
}
.textAreaExpandButton {
  @include color-ui-secondary;
}
</style>
