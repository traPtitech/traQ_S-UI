<template>
  <context-menu-container :position="position" @close="close">
    <div :class="$style.container">
      <button :class="$style.button" @click="updateStampImage">
        <a-icon name="file-image" mdi />
        スタンプ画像を更新する
      </button>
      <button :class="$style.button" @click="withClose(editStamp)">
        <a-icon name="pencil-outline" mdi />
        スタンプを編集する
      </button>
      <button
        :class="[$style.button, $style.dangerButton]"
        @click="withClose(deleteStamp)"
      >
        <a-icon name="delete" mdi />
        スタンプを削除する
      </button>
    </div>
  </context-menu-container>
</template>

<script lang="ts" setup>
import type { StampId } from '/@/types/entity-ids'
import type { Point } from '/@/lib/basic/point'
import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'
import { useModalStore } from '/@/store/ui/modal'
import { useFileSelect } from '/@/composables/dom/useFileSelect'
import apis from '/@/lib/apis'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps<{
  position: Point
  stampId: StampId
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { pushModal } = useModalStore()
const { execWithToast } = useExecWithToast()

const acceptImageType = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
].join(',')

const close = () => {
  emit('close')
}
const withClose = async (func: () => void | Promise<void>) => {
  await func()
  close()
}

const { selectImage } = useFileSelect({ accept: acceptImageType }, files => {
  if (!files[0]) return
  pushModal({
    type: 'settings-stamp-image-edit',
    id: props.stampId,
    file: files[0]
  })
  close()
})

const updateStampImage = () => {
  selectImage()
}

const editStamp = () => {
  pushModal({
    type: 'settings-stamp-edit',
    id: props.stampId
  })
}

const deleteStamp = () => {
  if (!confirm('本当にこのスタンプを削除しますか？')) return

  execWithToast(
    'スタンプを削除しました',
    'スタンプの削除に失敗しました',
    async () => {
      await apis.deleteStamp(props.stampId)
    }
  )
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include drop-shadow-default;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: max-content;
  padding: 16px 16px;
  border-radius: 4px;
}

.button {
  @include color-ui-primary;
  display: flex;
  gap: 12px;
  cursor: pointer;
}
.dangerButton {
  color: $theme-accent-error-default;
}
</style>
