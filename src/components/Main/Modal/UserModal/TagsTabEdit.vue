<template>
  <div :class="$style.container">
    <icon v-if="isLocked" name="lock" mdi :size="20" @click="toggleTagState" />
    <div v-else :class="$style.element">
      <icon name="close" mdi :size="20" @click="removeTag" />
      <icon
        v-if="isMine"
        name="lock-open"
        mdi
        :size="20"
        @click="toggleTagState"
        :class="$style.open"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { TagId } from '@/types/entity-ids'
import apis from '@/lib/apis'
import Icon from '@/components/UI/Icon.vue'
import store from '@/store'

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
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const myId = computed(() => store.state.domain.me.detail!.id)

    const removeTag = async () => {
      await apis.removeMyUserTag(props.tagId)
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
