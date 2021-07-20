<template>
  <div :class="$style.container">
    <file-description
      :file-id="props.fileId"
      :is-white="props.isWhite"
      :class="$style.description"
    />
    <div :class="$style.close">
      <close-button
        :size="24"
        :is-white="props.isWhite"
        :react-hover="!props.isWhite"
        @close="onClickClear"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from '/@/store'
import CloseButton from '/@/components/UI/CloseButton.vue'
import FileDescription from '/@/components/UI/FileDescription.vue'

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
  setup(props) {
    const onClickClear = () => store.dispatch.ui.modal.clearModal()
    return {
      props,
      onClickClear
    }
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
