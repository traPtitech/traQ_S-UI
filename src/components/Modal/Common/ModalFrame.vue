<template>
  <click-outside stop @click-outside="clearModal">
    <div :class="$style.container">
      <common-modal-header
        :class="$style.header"
        :icon-name="iconName"
        :icon-mdi="iconMdi"
        :title="title"
        :return-button="returnButton"
      >
        <template #subtitle>
          <template v-if="subtitle">
            {{ subtitle }}
          </template>
          <slot v-else name="subtitle" />
        </template>
      </common-modal-header>
      <div :class="$style.body">
        <slot />
      </div>
    </div>
  </click-outside>
</template>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import CommonModalHeader from './ModalHeader.vue'
import { useModalStore } from '/@/store/ui/modal'

withDefaults(
  defineProps<{
    iconMdi?: boolean
    iconName?: string
    title: string
    subtitle?: string
    returnButton?: boolean
  }>(),
  {
    iconMdi: false,
    subtitle: '',
    returnButton: false
  }
)

const { clearModal } = useModalStore()
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
  padding: 16px;
  overflow: {
    x: hidden;
    y: auto;
  }
  scrollbar-gutter: stable;
}
</style>
