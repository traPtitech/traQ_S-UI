<template>
  <div :class="$style.container">
    <img :src="url" :class="$style.stamp" />
    <div :class="$style.notSelected">
      <p>:{{ stamp.name }}:</p>
      <icon-button
        icon-name="pencil-outline"
        icon-mdi
        :class="$style.editIcon"
        @click="onStartEdit"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Stamp } from '@traptitech/traq'
import { computed } from 'vue'
import IconButton from '/@/components/UI/IconButton.vue'
import { buildFilePath } from '/@/lib/apis'

const props = defineProps<{
  stamp: Stamp
}>()

const emit = defineEmits<{
  (e: 'startEdit'): void
  (e: 'endEdit'): void
}>()

const url = computed(() => buildFilePath(props.stamp.fileId))

const onStartEdit = () => {
  emit('startEdit')
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
