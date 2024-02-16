<template>
  <div :class="$style.add">
    <div :class="$style.inputContainer">
      <input
        v-model="newTagName"
        type="text"
        :class="$style.input"
        placeholder="タグを追加"
      />
      <length-count :val="newTagName" :max-length="30" />
    </div>
    <button
      :class="$style.button"
      :disabled="newTagName.length === 0 || isExceeded || adding"
      @click="addTag"
    >
      <a-icon name="plus" mdi :class="$style.icon" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import { ref, reactive } from 'vue'
import apis from '/@/lib/apis'
import type { UserId } from '/@/types/entity-ids'
import useMaxLength from '/@/composables/utils/useMaxLength'
import { useToastStore } from '/@/store/ui/toast'
import { AxiosError } from 'axios'

const props = defineProps<{
  userId: UserId
}>()

const { addErrorToast } = useToastStore()

const newTagName = ref('')
const adding = ref(false)
const { isExceeded } = useMaxLength(
  reactive({ val: newTagName, maxLength: 30 })
)

const addTag = async () => {
  adding.value = true
  try {
    await apis.addUserTag(props.userId, {
      tag: newTagName.value
    })
    newTagName.value = ''
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 409) {
      addErrorToast('既に同じ名前のタグがついています')
    } else {
      addErrorToast('タグの追加に失敗しました')
    }
  }
  adding.value = false
}
</script>

<style lang="scss" module>
.add {
  display: flex;
  flex-direction: row;
  margin: 8px;
}

.inputContainer {
  @include color-ui-secondary;
  @include background-secondary;
  display: flex;
  align-items: center;
  flex: 1 1;
  padding: 4px;
  border-radius: 6px;
}

.input {
  @include color-text-primary;
  width: 100%;
  padding: 0 8px;
  &::placeholder {
    @include color-ui-secondary;
  }
}

.button {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 0 12px;
  margin-left: 8px;
  border-radius: 6px;
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
  }
}

.icon {
  vertical-align: middle;
}
</style>
