<template>
  <div :class="$style.container">
    <modal-return-button v-if="returnButton" :class="$style.returnButton" />
    <div :class="$style.content">
      <h1 :class="$style.title">
        <a-icon :class="$style.icon" :name="iconName" :mdi="iconMdi" />{{
          title
        }}
      </h1>
      <h2 :class="$style.subtitle"><slot name="subtitle" /></h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import ModalReturnButton from './ModalReturnButton.vue'

export default defineComponent({
  name: 'ModalHeader',
  components: { AIcon, ModalReturnButton },
  props: {
    iconMdi: { type: Boolean, default: false },
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    returnButton: { type: Boolean, default: false }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  width: 100%;
  padding: 16px;
  display: flex;
}
.content {
  width: 100%;
}
.returnButton {
  @include color-ui-primary;
  padding-right: 4px;
  margin-left: -8px;
  flex-shrink: 0;
}
.title {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  width: 100%;
  font: {
    weight: bold;
    size: 1.125rem;
  }
}
.subtitle {
  @include color-ui-secondary;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 40px;
  font: {
    weight: 500;
    size: 0.875rem;
  }
}
.icon {
  margin-right: 16px;
}
</style>
