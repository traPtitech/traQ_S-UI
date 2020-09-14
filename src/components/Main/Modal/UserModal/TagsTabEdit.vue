<template>
  <div :class="$style.container">
    <icon
      v-if="isLocked"
      name="lock"
      mdi
      :size="20"
      @click.stop="toggleTagState"
    />
    <div v-else :class="$style.element">
      <icon name="close" mdi :size="20" @click.stop="removeTag" />
      <icon
        v-if="isMine"
        name="lock-open"
        mdi
        :size="20"
        @click.stop="toggleTagState"
        :class="$style.open"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { TagId, UserId } from '@/types/entity-ids'
import apis from '@/lib/apis'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'TagsTabEdit',
  components: {
    Icon
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
    userId: String as PropType<UserId>,
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const removeTag = async () => {
      if (!props.userId) return

      if (!confirm(`本当にこのタグを削除しますか？`)) return
      await apis.removeUserTag(props.userId, props.tagId)
    }

    const toggleTagState = async () => {
      await apis.editMyUserTag(props.tagId, { isLocked: !props.isLocked })
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
