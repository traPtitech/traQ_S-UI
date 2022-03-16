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

<script lang="ts" setup>
import CloseButton from '/@/components/UI/CloseButton.vue';
import FileDescription from '/@/components/UI/FileDescription.vue';
import { useModalStore } from '/@/store/ui/modal'

withDefaults(defineProps<{
    fileId: string,
    isWhite?: boolean
}>(), {
    isWhite: false
})

const { clearModal } = useModalStore()
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
