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

<script lang="ts">
import { computed, defineComponent } from 'vue'
import MessageInputUploadButton from './MessageInputUploadButton.vue'
import MessageInputPreviewButton from './MessageInputPreviewButton.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import useIsMobile from '/@/use/isMobile'

export default defineComponent({
  name: 'MessageInputLeftControls',
  components: {
    IconButton,
    MessageInputUploadButton,
    MessageInputPreviewButton
  },
  props: {
    isExpanded: {
      type: Boolean,
      required: true
    },
    isPreviewShown: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    'update:isExpanded': (v: boolean) => true,
    'update:isPreviewShown': (v: boolean) => true,
    clickAddAttachment: () => true
  },
  setup(props, { emit }) {
    const { isMobile } = useIsMobile()
    const toggleExpanded = () => {
      emit('update:isExpanded', !props.isExpanded)
    }

    const isPreviewShownValue = computed<boolean>({
      get() {
        return props.isPreviewShown
      },
      set(v) {
        emit('update:isPreviewShown', v)
      }
    })

    const onClickAddAttachment = () => {
      emit('clickAddAttachment')
    }

    return {
      toggleExpanded,
      isPreviewShownValue,
      onClickAddAttachment,
      isMobile
    }
  }
})
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
