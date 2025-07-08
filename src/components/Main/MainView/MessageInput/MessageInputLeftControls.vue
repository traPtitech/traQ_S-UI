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

const isLeftControlsExpanded = defineModel<boolean>('isLeftControlsExpanded', {
  required: true
})
const isPreviewShown = defineModel<boolean>('isPreviewShown', {
  required: true
})
const isInputTextAreaExpanded = defineModel<boolean>(
  'isInputTextAreaExpanded',
  {
    required: true
  }
)

const props = defineProps<{
  showTextAreaExpandButton: boolean
}>()

const emit = defineEmits<{
  (e: 'clickAddAttachment'): void
  (e: 'toggleLeftControlsExpanded'): void
}>()

const { isMobile } = useResponsiveStore()
const toggleLeftControlsExpanded = () => {
  isLeftControlsExpanded.value = !isLeftControlsExpanded.value
  emit('toggleLeftControlsExpanded')
}
const toggleIsInputTextAreaExpanded = () => {
  isInputTextAreaExpanded.value = !isInputTextAreaExpanded.value
}

const isPreviewShownValue = computed<boolean>({
  get() {
    return isPreviewShown.value
  },
  set(v) {
    isPreviewShown.value = v
    isLeftControlsExpanded.value = false
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
