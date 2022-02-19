<template>
  <div>
    <div :class="$style.label">{{ label }}</div>
    <div v-if="isEditing" :class="$style.inputWrapper">
      <form-input
        v-model="editingValue"
        :class="$style.input"
        :max-length="maxLength"
        on-secondary
      />
      <a-icon
        name="check"
        mdi
        :class="$style.icon"
        :size="20"
        @click="endEditing"
      />
    </div>
    <div v-else :class="$style.valueWrapper">
      <div :class="$style.value" :data-is-empty="value === ''">
        {{ value || `${label}が設定されていません` }}
      </div>
      <a-icon
        name="pencil-outline"
        mdi
        :class="$style.icon"
        :size="20"
        @click="startEditing"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import FormInput from '/@/components/UI/FormInput.vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'LineEditor',
  components: {
    FormInput,
    AIcon
  },
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    maxLength: {
      type: Number,
      default: undefined
    }
  },
  emits: {
    update: (_value: string) => true
  },
  setup(props, { emit }) {
    const editingValue = ref(props.value)
    watch(
      () => props.value,
      v => {
        editingValue.value = v
      }
    )

    const isEditing = ref(false)
    const startEditing = () => {
      isEditing.value = true
    }
    const endEditing = () => {
      isEditing.value = false
      if (props.value !== editingValue.value) {
        emit('update', editingValue.value)
      }
    }

    return { editingValue, isEditing, startEditing, endEditing }
  }
})
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  font-weight: bold;
}
.icon {
  @include color-ui-primary-inactive;
  margin-left: 4px;
  cursor: pointer;
  &:hover {
    @include color-ui-primary;
  }
}

.inputWrapper {
  @include color-ui-primary;
  display: flex;
  align-items: center;
}
.input {
  flex: 1;
}

.valueWrapper {
  display: flex;
  align-items: center;
}
.value {
  @include color-ui-primary;
  flex: 1;
  height: 24px;
  // inputに合わせるため4pxの倍数でない
  margin: 3px 0;
  &[data-is-empty='true'] {
    @include color-ui-primary-inactive;
  }
}
</style>
