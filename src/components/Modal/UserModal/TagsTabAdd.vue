<template>
  <div :class="$style.add">
    <div :class="$style.inputContainer">
      <input
        type="text"
        :class="$style.input"
        v-model="newTagName"
        placeholder="タグを追加"
      />
      <length-count :val="newTagName" :max-length="30" />
    </div>
    <button
      :class="$style.button"
      @click="addTag"
      :disabled="newTagName.length === 0 || isExceeded || adding"
    >
      <icon name="plus" mdi :class="$style.icon" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, reactive } from 'vue'
import apis from '@/lib/apis'
import { UserId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import LengthCount from '@/components/UI/LengthCount.vue'
import useMaxLength from '@/use/maxLength'
import useToastStore from '@/use/toastStore'

export default defineComponent({
  name: 'TagsTab',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
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
      } catch {
        addErrorToast('タグの追加に失敗しました')
      }
      adding.value = false
    }

    return { newTagName, isExceeded, addTag, adding }
  },
  components: {
    Icon,
    LengthCount
  }
})
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
