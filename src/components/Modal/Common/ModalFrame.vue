<template>
  <click-outside stop @click-outside="onClickOutside">
    <div :class="$style.container">
      <common-modal-header
        :class="$style.header"
        :icon-name="iconName"
        :icon-mdi="iconMdi"
        :title="title"
        :return-button="returnButton"
      >
        <template #subtitle>
          <template v-if="subtitle">{{ subtitle }}</template>
          <slot v-else name="subtitle" />
        </template>
      </common-modal-header>
      <div :class="$style.body">
        <slot />
      </div>
    </div>
  </click-outside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from '/@/vuex'
import ClickOutside from '/@/components/UI/ClickOutside'
import CommonModalHeader from './ModalHeader.vue'

export default defineComponent({
  name: 'ModalFrame',
  components: {
    ClickOutside,
    CommonModalHeader
  },
  props: {
    iconMdi: { type: Boolean, default: false },
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    returnButton: { type: Boolean, default: false }
  },
  setup() {
    const onClickOutside = () => store.dispatch.ui.modal.clearModal()
    return { onClickOutside }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  display: flex;
  flex-flow: column nowrap;
  max-height: 480px;
  max-width: 440px;
  width: #{calc(100% - 32px)};
  border-radius: 4px;
  overflow: hidden;
  border: {
    style: solid;
    width: 2px;
    color: $theme-background-secondary-border;
  }
}
.header {
  flex-shrink: 0;
}
.body {
  width: 100%;
  padding: 16px 24px;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
</style>
