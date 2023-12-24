<template>
  <div>
    <h3 :class="$style.header">キャッシュ</h3>
    <div :class="$style.content">
      <p v-if="cacheData && cacheData.usage" :class="$style.usage">
        <span>{{ prettifyFileSize(cacheData.usage) }}</span>
      </p>
      <form-button
        :class="$style.button"
        label="削除する"
        type="secondary"
        is-danger
        @click="openClearCacheModal"
      />
    </div>
    <clear-cache />
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { checkStorageManagerSupport } from '/@/lib/dom/browser'
import { prettifyFileSize } from '/@/lib/basic/file'

declare global {
  interface StorageEstimate {
    usageDetails: Record<string, number>
  }
}

const isStorageManagerSupported = checkStorageManagerSupport()
const getStorageUsage = async () => {
  if (!isStorageManagerSupported) return null

  return navigator.storage.estimate()
}
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import ClearCache from './ClearCache.vue'

const cacheData = ref<StorageEstimate | null>(null)
const setCacheData = async () => {
  cacheData.value = await getStorageUsage()
}
onMounted(setCacheData)

const openClearCacheModal = async () => {
  return
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.usage {
  margin-bottom: 8px;
}
.button {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
