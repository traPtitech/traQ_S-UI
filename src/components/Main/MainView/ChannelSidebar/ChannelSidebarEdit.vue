<template>
  <div :class="$style.container">
    <div
      :class="$style.content"
      :data-is-editing="$boolAttr(isEditing)"
      @click="onClick"
    >
      <a-icon
        mdi
        :name="isEditing ? 'toggle-switch-on' : 'toggle-switch-off'"
        height="20"
        width="20"
      />
      <div>編集</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const isEditing = ref(false)

const onClick = () => {
  isEditing.value = !isEditing.value
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.content {
  @include color-ui-secondary;
  @include size-body2;
  bottom: 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  width: 100%;
  &[data-is-editing] {
    @include color-ui-primary;
  }
}
</style>
