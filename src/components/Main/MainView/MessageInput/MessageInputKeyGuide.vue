<template>
  <div v-if="show" :class="$style.container">
    + Enterを押して{{ sendWithModifierKey === 'modifier' ? sendText : '改行' }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useBrowserSettings } from '/@/store/app/browserSettings'

const props = withDefaults(defineProps<{
    show: boolean,
    isEdit?: boolean
}>(), {
    isEdit: false
});

const { sendWithModifierKey } = useBrowserSettings()
const sendText = computed(() => (props.isEdit ? '保存' : '送信'))
</script>

<style lang="scss" module>
.container {
  @include color-text-secondary;
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
}
</style>
