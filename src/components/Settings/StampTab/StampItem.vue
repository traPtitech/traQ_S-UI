<template>
  <div :class="$style.container">
    <img :src="url" :class="$style.stamp" />
    <div :class="$style.notSelected">
      <p>:{{ stamp.name }}:</p>
      <icon-button
        icon-name="dots-horizontal"
        icon-mdi
        :class="$style.editIcon"
        @click="onDotsClick"
      />
    </div>
    <stamp-context-menu
      v-if="contextMenuPosition"
      :position="contextMenuPosition"
      :stamp-id="stamp.id"
      @close="closeContextMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Stamp } from '@traptitech/traq'
import { computed } from 'vue'
import IconButton from '/@/components/UI/IconButton.vue'
import { buildFilePath } from '/@/lib/apis'
import useContextMenu from '/@/composables/useContextMenu'
import StampContextMenu from './StampContextMenu.vue'

const props = defineProps<{
  stamp: Stamp
}>()

const url = computed(() => buildFilePath(props.stamp.fileId))

const {
  position: contextMenuPosition,
  open: openContextMenu,
  close: closeContextMenu
} = useContextMenu()

const onDotsClick = (e: MouseEvent) => {
  openContextMenu({
    x: e.pageX,
    y: e.pageY
  })
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  display: flex;
  align-items: center;
  padding: {
    left: 12px;
    top: 12px;
    bottom: 12px;
  }
  &:hover {
    @include background-tertiary;
  }
}

.editIcon {
  @include color-ui-secondary;
}

.stamp {
  height: 40px;
  width: 40px;
}
.notSelected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 24px;
}
</style>
