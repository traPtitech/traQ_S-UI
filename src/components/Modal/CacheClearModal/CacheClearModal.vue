<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div>
      <div :class="$style.content">
        <p v-if="cacheData && cacheData.usage" :class="$style.usage">
          <template v-if="cacheData.usageDetails">
            <label v-for="(usage, key) in cacheData.usageDetails" :key="key">
              <input v-model="selectedCaches" type="checkbox" :value="key" />
              {{ key }} {{ prettifyFileSize(usage) }}
            </label>
          </template>
          <template v-else>
            {{ prettifyFileSize(cacheData.usage) }}
          </template>
        </p>
        <form-button
          :class="$style.button"
          label="キャンセル"
          @click="clearModal"
        />
        <form-button
          :class="$style.button"
          label="削除する"
          is-danger
          @click="clearCache"
        />
      </div>
    </div>
  </modal-frame>
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
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'

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

const selectedCaches = ref<Array<string>>([])

const { clearModal } = useModalStore()

const clearCache = async () => {
  if (!confirmClear()) return
  for (const key of selectedCaches.value) {
    switch (key) {
      case 'caches': {
        const names = await window.caches.keys()
        await Promise.all(
          names
            .filter(name => name.startsWith('traQ_S-precache'))
            .map(name => clearCacheStorage(name))
        )
        break
      }
      case 'indexedDB': {
        await clearCacheStorage('files-cache')
        break
      }
      case 'serviceWorkerRegistrations': {
        await clearCacheStorage('thumbnail-cache')
        break
      }
    }
  }
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
