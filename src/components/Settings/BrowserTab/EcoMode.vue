<template>
  <div>
    <div :class="$style.eco">
      <h3 :class="$style.header">省エネモード</h3>
      <a-toggle v-model="value" :class="$style.toggle" />
    </div>
    <div :class="$style.content">
      <p>
        省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: boolean): void
}>()

const value = useModelValueSyncer(props, emit)
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.eco {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
</style>
