<template>
  <div :class="$style.container" :data-is-title="$boolAttr(isTitle)">
    <user-icon
      v-if="id"
      :class="$style.icon"
      :user-id="id"
      :size="isTitle ? 24 : 20"
    />
    <span :class="$style.displayName">
      {{ displayName }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { User } from '@traptitech/traq'
import UserIcon from '/@/components/UI/UserIcon.vue'

export default defineComponent({
  name: 'UserName',
  components: {
    UserIcon
  },
  props: {
    user: {
      type: Object as PropType<User>,
      default: undefined
    },
    isTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const id = computed(() => props.user?.id)
    const displayName = computed(() => props.user?.displayName ?? 'unknown')

    return { id, displayName }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  display: flex;
  align-items: center;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  overflow: hidden;
  &[data-is-title] {
    @include color-ui-primary;
    @include size-body1;
    font-weight: bold;
  }
}
.icon {
  margin-right: 8px;
}
.displayName {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .container[data-is-title] & {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
    word-break: break-all;
  }
}
</style>
