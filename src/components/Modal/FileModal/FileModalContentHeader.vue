<template>
  <div :class="$style.container">
    <file-description
      :file-id="fileId"
      :is-white="isWhite"
      :class="$style.description"
    />
    <div :class="$style.close">
      <close-button
        :size="24"
        :is-white="isWhite"
        :react-hover="!isWhite"
        @close="clearModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CloseButton from '/@/components/UI/CloseButton.vue'
import FileDescription from '/@/components/UI/FileDescription.vue'
import { useModalStore } from '/@/store/ui/modal'

export default defineComponent({
  name: 'FileModalContentHeader',
  components: {
    CloseButton,
    FileDescription
  },
  props: {
    fileId: {
      type: String,
      required: true
    },
    isWhite: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { clearModal } = useModalStore()
    return { clearModal }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
}
.close {
  display: flex;
  align-items: center;
}
.description {
  padding: 0 16px;
}
</style>
