<template>
  <div :class="$style.container">
    <div
      :class="$style.content"
      :data-is-editing="$boolAttr(state.isEditing)"
      @click="onClick"
    >
      <a-icon
        mdi
        :name="state.isEditing ? 'toggle-switch-on' : 'toggle-switch-off'"
        height="20"
        width="20"
      />
      <div>編集</div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue';

type State = {
  isEditing: boolean
}
</script>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';

const state: State = reactive({
  isEditing: false
})
const onClick = () => {
  state.isEditing = !state.isEditing
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
