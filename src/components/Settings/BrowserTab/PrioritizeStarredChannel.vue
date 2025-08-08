<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>未読画面でお気に入りを優先表示</h3>
      <p>
        未読チャンネル一覧でお気に入りチャンネルを優先的に表示するようにします。
      </p>
    </div>
    <div>
      <a-toggle v-model="modelValue" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'

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
