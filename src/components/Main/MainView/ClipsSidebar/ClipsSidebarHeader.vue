<template>
  <div :class="$style.container">
    <icon mdi name="bookmark" :class="$style.icon" />
    <h2 :class="$style.header">{{ name }}</h2>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ClipsSidebarHeader',
  components: { Icon },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    return { name }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  height: 100%;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
  flex-shrink: 0;
}
.header {
  @include size-h2;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
