<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <div>
      <a-toggle v-model="modelValue" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'

const props = defineProps<{
  title: string
  description: string
}>()
const { title, description } = props
const modelValue = defineModel<boolean>({ required: true })
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
