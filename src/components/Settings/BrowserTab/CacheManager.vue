<template>
  <div>
    <h3 :class="$style.header">キャッシュ</h3>
    <div :class="$style.content">
      <p v-if="cacheData && cacheData.usage" :class="$style.usage">
        <template v-if="cacheData.usageDetails">
          <span v-for="(usage, key) in cacheData.usageDetails" :key="key">
            {{ prettifyFileSize(usage) }} ({{ key }})
          </span>
        </template>
        <template v-else>
          {{ prettifyFileSize(cacheData.usage) }}
        </template>
      </p>
      <form-button
        :class="$style.button"
        label="削除する"
        @click="clearCache"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import { wait } from '/@/lib/basic/timer'
import { checkStorageManagerSupport } from '/@/lib/dom/browser'
import { prettifyFileSize } from '/@/lib/basic/file'
import { useStampsStore } from '/@/store/entities/stamps'

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

const confirmClear = () => window.confirm('本当に削除しますか？')

/* CacheStorageのnameはsw.jsを参照 */
const clearCacheStorage = (cacheName: string) => window.caches.delete(cacheName)
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'

const { fetchStamps } = useStampsStore()
const { addSuccessToast } = useToastStore()
const showToast = (extraMesage?: string) => {
  addSuccessToast(`削除に成功しました${extraMesage ? `: ${extraMesage}` : ''}`)
}

const cacheData = ref<StorageEstimate | null>(null)
const setCacheData = async () => {
  cacheData.value = await getStorageUsage()
}
onMounted(setCacheData)

const clearCache = async () => {
  if (!confirmClear()) return

  const names = await window.caches.keys()
  await Promise.all(
    names
      .filter(name => name.startsWith('traQ_S-precache'))
      .map(name => clearCacheStorage(name))
  )
  await clearCacheStorage('files-cache')
  await clearCacheStorage('thumbnail-cache')

  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) {
    registration.unregister()
    showToast('1秒後にリロードします')
    setCacheData()
    await wait(1000)
    window.location.reload()
  } else {
    showToast()
  }
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
