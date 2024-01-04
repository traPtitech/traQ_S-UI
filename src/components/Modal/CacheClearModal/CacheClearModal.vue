<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <div v-if="cacheData && cacheData.usage" :class="$style.checkboxes">
        <div v-if="cacheData.usageDetails">
          <label
            v-for="(usage, key) in cacheData.usageDetails"
            :key="key"
            :for="key"
            :class="$style.outerLabel"
          >
            <input
              :id="key"
              v-model="selectedCaches[key]"
              type="checkbox"
              :class="$style.checkbox"
            />
            <label :for="key" :class="$style.innerLabel">
              {{ cacheLabel(key) }}
              <span>{{ prettifyFileSize(usage) }}</span>
            </label>
          </label>
        </div>
        <div v-else>
          <label for="allCache" :class="$style.outerLabel">
            <input
              id="allCache"
              v-model="allCaches"
              type="checkbox"
              :class="$style.checkbox"
            />
            <label for="allCache" :class="$style.innerLabel">
              全てのキャッシュ
              <span>{{ prettifyFileSize(cacheData.usage) }}</span>
            </label>
          </label>
        </div>
      </div>
      <div v-else>キャッシュデータは存在しません</div>
      <div :class="$style.buttonContainer">
        <form-button label="キャンセル" type="tertiary" @click="clearModal" />
        <form-button
          label="削除する"
          type="secondary"
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
import { reactive } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'

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

const caches = 'caches'
const indexedDB = 'indexedDB'
const serviceWorkerRegistrations = 'serviceWorkerRegistrations'

const selectedCaches = reactive<{
  [key: string]: boolean
}>({
  caches: false,
  indexedDB: false,
  serviceWorkerRegistrations: false
})
const allCaches = ref<boolean>(false)

const cacheLabel = (cacheName: string) => {
  switch (cacheName) {
    case caches:
      return 'traQ本体'
    case indexedDB:
      return 'ファイルの本体一覧'
    case serviceWorkerRegistrations:
      return 'ファイルのサムネイル一覧'
    default:
      return cacheName
  }
}

const { clearModal } = useModalStore()

const clearCache = async () => {
  if (!confirmClear()) return
  if (allCaches.value || selectedCaches[caches]) {
    const names = await window.caches.keys()
    await Promise.all(
      names
        .filter(name => name.startsWith('traQ_S-precache'))
        .map(name => clearCacheStorage(name))
    )
  }
  if (allCaches.value || selectedCaches[indexedDB]) {
    await clearCacheStorage('files-cache')
  }
  if (allCaches.value || selectedCaches[serviceWorkerRegistrations]) {
    await clearCacheStorage('thumbnail-cache')
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
.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 -8px;
}
.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.outerLabel {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
  align-items: center;
}
.checkbox {
  appearance: none;
  height: 13px;
  width: 13px;
  margin: 5.5px;
  border: 2px solid $theme-ui-primary-default;
  border-radius: 4px;
}
.checkbox:checked {
  background: $theme-ui-primary-background;
}
.innerLabel {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
}
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  cursor: pointer;
  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
</style>
