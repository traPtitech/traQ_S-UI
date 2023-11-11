<template>
  <div :class="$style.container">
    <img :src="url" :class="$style.stamp" loading="lazy" />
    <div :class="$style.innerContainer">
      <div :class="$style.textContainer">
        <p>:{{ stamp.name }}:</p>
        <p
          v-if="showCreator"
          :title="`@${stamp.creatorId}`"
          :class="$style.creator"
        >
          @{{ stamp.creatorId }}
        </p>
      </div>
      <icon-button
        icon-name="dots-horizontal"
        icon-mdi
        :class="$style.dotsButon"
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

const props = withDefaults(
  defineProps<{
    stamp: Stamp
    showCreator?: boolean
  }>(),
  {
    showCreator: false
  }
)

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
}

.textContainer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.creator {
  @include color-ui-secondary;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dotsButon {
  @include color-ui-tertiary;
  padding: 4px;
  &:hover {
    @include color-ui-secondary;
    @include background-secondary;
  }
}

.stamp {
  height: 40px;
  width: 40px;
}
.innerContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  padding: 0 24px;
}
</style>
