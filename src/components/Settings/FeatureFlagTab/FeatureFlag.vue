<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>{{ props.title }}</h3>
      <p>{{ props.description }}</p>
      <h4>提供終了日</h4>
      <p>
        {{ props.endAt.toLocaleDateString() }}
      </p>
    </div>
    <div>
      <a-toggle v-model="value" :disabled="props.endAt < new Date()"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = defineProps<{
  title: string
  description: string
  modelValue: boolean
  endAt: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _val: boolean): void
}>()

const value = useModelValueSyncer(props, emit)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
