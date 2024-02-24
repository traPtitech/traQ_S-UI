<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <div
        v-if="cacheData && cacheData.usage"
        :class="$style.checkboxContainer"
      >
        <div v-if="cacheData.usageDetails">
          <form-checkbox
            v-for="(usage, key) in cacheData.usageDetails"
            :key="key"
            v-model="cacheSelectedStateTable[key]"
            :class="$style.checkbox"
          >
            <div :class="$style.label">
              {{ cacheLabel(key) }}
              <span>{{ prettifyFileSize(usage) }}</span>
            </div>
          </form-checkbox>
        </div>
        <div v-else>
          <form-checkbox v-model="allCachesSelected" :class="$style.checkbox">
            <div :class="$style.label">
              全てのキャッシュ
              <span>{{ prettifyFileSize(cacheData.usage) }}</span>
            </div>
          </form-checkbox>
        </div>
      </div>
      <div v-else>キャッシュデータは存在しません</div>
      <div :class="$style.buttonContainer">
        <form-button label="キャンセル" type="tertiary" @click="clearModal" />
        <form-button
          label="削除する"
          type="secondary"
          :disabled="!anyCacheSelected"
          is-danger
          @click="clearCache"
        />
      </div>
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import { wait } from '/@/lib/basic/timer'
import { checkStorageManagerSupport } from '/@/lib/dom/browser'
import { prettifyFileSize } from '/@/lib/basic/file'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'

declare global {
  interface StorageEstimate {
    usageDetails: Record<CacheName, number>
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

type CacheName = 'caches' | 'indexedDB' | 'serviceWorkerRegistrations'
const caches = 'caches'
const indexedDB = 'indexedDB'
const serviceWorkerRegistrations = 'serviceWorkerRegistrations'

const cacheSelectedStateTable = ref<Record<CacheName, boolean>>({
  caches: false,
  indexedDB: false,
  serviceWorkerRegistrations: false
})
const allCachesSelected = ref<boolean>(false)
const anyCacheSelected = computed(() => {
  return (
    allCachesSelected.value ||
    Object.values(cacheSelectedStateTable).includes(true)
  )
})

const cacheLabel = (cacheName: CacheName) => {
  switch (cacheName) {
    case 'caches':
      return 'traQ本体'
    case 'indexedDB':
      return 'ファイルの本体一覧'
    case 'serviceWorkerRegistrations':
      return 'ファイルのサムネイル一覧'
    default:
      throw new Error(`Unknown cache name: ${cacheName satisfies CacheName}`)
  }
}

const { clearModal } = useModalStore()

const isClearingCache = ref<boolean>(false)

const clearMainCache = async () => {
  const names = await window.caches.keys()
  return names
    .filter(name => name.startsWith('traQ_S-precache'))
    .map(name => clearCacheStorage(name))
}

const clearCache = async () => {
  if (!confirmClear()) return
  isClearingCache.value = true
  const promises = []
  if (allCachesSelected.value || cacheSelectedStateTable.value[caches]) {
    promises.push(clearMainCache())
  }
  if (allCachesSelected.value || cacheSelectedStateTable.value[indexedDB]) {
    promises.push(clearCacheStorage('files-cache'))
  }
  if (
    allCachesSelected.value ||
    cacheSelectedStateTable.value[serviceWorkerRegistrations]
  ) {
    promises.push(clearCacheStorage('thumbnail-cache'))
  }
  await Promise.all(promises.flat())
  if (!(allCachesSelected.value || cacheSelectedStateTable.value[caches])) {
    setCacheData()
    isClearingCache.value = false
    clearModal()
    showToast()
    return
  }
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration) {
    isClearingCache.value = false
    clearModal()
    showToast()
    return
  }
  registration.unregister()
  isClearingCache.value = false
  clearModal()
  showToast('1秒後にリロードします')
  setCacheData()
  await wait(1000)
  window.location.reload()
}
</script>

<style lang="scss" module>
.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.checkboxContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.checkbox {
  @include color-ui-secondary;
  &:has(:checked) {
    @include color-ui-primary;
  }
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
  align-items: center;
  cursor: pointer;
  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
}
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style>
