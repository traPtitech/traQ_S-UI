<template>
  <div :class="$style.container">
    <a-icon
      v-if="isLocked"
      name="lock"
      mdi
      :size="20"
      @click.stop="toggleTagState"
    />
    <div v-else :class="$style.element">
      <a-icon name="close" mdi :size="20" @click.stop="removeTag" />
      <a-icon
        v-if="isMine"
        name="lock-open"
        mdi
        :size="20"
        :class="$style.open"
        @click.stop="toggleTagState"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TagId, UserId } from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import AIcon from '/@/components/UI/AIcon.vue'
import useToastStore from '/@/providers/toastStore'

export default defineComponent({
  name: 'TagsTabEdit',
  components: {
    AIcon
  },
  props: {
    tagId: {
      type: String as PropType<TagId>,
      required: true
    },
    isMine: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String as PropType<UserId>,
      default: undefined
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const removeTag = async () => {
      if (!props.userId) return

      if (!confirm(`本当にこのタグを削除しますか？`)) return

      try {
        await apis.removeUserTag(props.userId, props.tagId)
      } catch {
        addErrorToast('タグの削除に失敗しました')
      }
    }

    const toggleTagState = async () => {
      try {
        await apis.editMyUserTag(props.tagId, { isLocked: !props.isLocked })
      } catch {
        addErrorToast('タグのロックに失敗しました')
      }
    }

    return { removeTag, toggleTagState }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: flex-end;
}
.element {
  display: flex;
}
.open {
  margin-left: 4px;
}
</style>
