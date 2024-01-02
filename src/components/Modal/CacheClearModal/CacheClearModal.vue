<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <p v-if="cacheData && cacheData.usage" :class="$style.usage">
        <template v-if="cacheData.usageDetails">
          <div v-for="(usage, key) in cacheData.usageDetails" :key="key">
            <label>
              <input v-model="selectedCaches" type="checkbox" />
              {{ cacheLabel(key) }}
              {{ prettifyFileSize(usage) }}
            </label>
          </div>
        </template>
        <template v-else>
          <form-checkbox
            v-model="allCaches"
            :label="prettifyFileSize(cacheData.usage)"
          />
        </template>
      </p>
      <p v-else>キャッシュデータは存在しません</p>
      <form-button
        :class="$style.button"
        label="キャンセル"
        type="tertiary"
        @click="clearModal"
      />
      <form-button
        :class="$style.button"
        label="削除する"
        type="secondary"
        is-danger
        @click="clearCache"
      />n
    </div>
  </modal-frame>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import { wait } from '/@/lib/basic/timer'
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

const confirmClear = () => window.confirm('本当に削除しますか？')

/* CacheStorageのnameはsw.jsを参照 */
const clearCacheStorage = (cacheName: string) => window.caches.delete(cacheName)
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'

const { addSuccessToast } = useToastStore()
const showToast = (extraMessage?: string) => {
  addSuccessToast(
    `削除に成功しました${extraMessage ? `: ${extraMessage}` : ''}`
  )
}

const cacheData = ref<StorageEstimate | null>(null)
const setCacheData = async () => {
  cacheData.value = await getStorageUsage()
}
onMounted(setCacheData)

const selectedCaches = ref<Array<string>>([])
const allCaches = ref<boolean>(false)

const cacheLabel = (cacheName: string) => {
  switch (cacheName) {
    case 'caches':
      return 'traQ本体'
    case 'indexedDB':
      return 'ファイルの本体一覧'
    case 'serviceWorkerRegistrations':
      return 'ファイルのサムネイル一覧'
    default:
      return cacheName
  }
}

const { clearModal } = useModalStore()

const clearCache = async () => {
  if (!confirmClear()) return
  const promises = selectedCaches.value.map(async key => {
    switch (key) {
      case 'caches': {
        const names = await window.caches.keys()
        return Promise.all(
          names
            .filter(name => name.startsWith('traQ_S-precache'))
            .map(name => clearCacheStorage(name))
        )
      }
      case 'indexedDB': {
        return clearCacheStorage('files-cache')
      }
      case 'serviceWorkerRegistrations': {
        return clearCacheStorage('thumbnail-cache')
      }
    }
  })
  await Promise.all(promises)
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
