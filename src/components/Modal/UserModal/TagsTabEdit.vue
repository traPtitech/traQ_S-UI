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

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import type { TagId, UserId } from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'

const props = withDefaults(
  defineProps<{
    tagId: TagId
    isMine?: boolean
    userId?: UserId
    isLocked?: boolean
  }>(),
  {
    isMine: false,
    isLocked: false
  }
)

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
