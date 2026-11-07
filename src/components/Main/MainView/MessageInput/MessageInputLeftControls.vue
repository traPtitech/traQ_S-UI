<template>
  <div :class="$style.outerContainer" :style="outerContainerStyle">
    <IconButton
      v-if="showExpandButton"
      :class="$style.expandButton"
      :icon-name="isExpanded ? 'chevron-down' : 'chevron-up'"
      icon-mdi
      @click="toggleExpanded"
    />
    <div :class="$style.innerContainer" :data-is-mobile="$boolAttr(isMobile)">
      <template v-if="!isMobile || isLeftControlsExpanded">
        <MessageInputUploadButton
          :class="$style.button"
          @click="emit('clickAddAttachment')"
        />
        <MessageInputPreviewButton
          v-model="isPreviewShownValue"
          :class="$style.button"
        />
      </template>
      <IconButton
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

import IconButton from '/@/components/UI/IconButton.vue'
import useResponsive from '/@/composables/useResponsive'

import MessageInputPreviewButton from './MessageInputPreviewButton.vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'

const isLeftControlsExpanded = defineModel<boolean>('isLeftControlsExpanded', {
  required: true
})

const isPreviewShown = defineModel<boolean>('isPreviewShown', {
  required: true
})

const isExpanded = defineModel<boolean>('isExpanded', {
  required: true
})

const props = defineProps<{
  showExpandButton: boolean
}>()

const emit = defineEmits<{
  (e: 'clickAddAttachment'): void
  (e: 'toggleLeftControlsExpanded'): void
}>()

const { isMobile } = useResponsive()

const toggleLeftControlsExpanded = () => {
  isLeftControlsExpanded.value = !isLeftControlsExpanded.value
  emit('toggleLeftControlsExpanded')
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
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
  '--justify-content': props.showExpandButton ? 'space-between' : 'flex-end'
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

.expandButton {
  @include color-ui-secondary;
}
</style>
