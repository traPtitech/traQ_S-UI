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
            :aria-checked="selectedCaches[key]"
          >
            <form-checkbox-inner :id="key" v-model="selectedCaches[key]" />
            <label :for="key" :class="$style.innerLabel">
              {{ cacheLabel(key) }}
              <span>{{ prettifyFileSize(usage) }}</span>
            </label>
          </label>
        </div>
        <div v-else>
          <label
            for="allCaches"
            :class="$style.outerLabel"
            :aria-checked="allCachesSelected"
          >
            <form-checkbox-inner id="allCaches" v-model="allCachesSelected" />
            <label for="allCaches" :class="$style.innerLabel">
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
          :disabled="!anyCacheSelected"
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
import { reactive, computed } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import FormCheckboxInner from '/@/components/UI/FormCheckboxInner.vue'

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
const allCachesSelected = ref<boolean>(false)
const anyCacheSelected = computed(() => {
  return allCachesSelected.value || Object.values(selectedCaches).find(v => v)
})

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
  if (allCachesSelected.value || selectedCaches[caches]) {
    const names = await window.caches.keys()
    await Promise.all(
      names
        .filter(name => name.startsWith('traQ_S-precache'))
        .map(name => clearCacheStorage(name))
    )
  }
  if (allCachesSelected.value || selectedCaches[indexedDB]) {
    await clearCacheStorage('files-cache')
  }
  if (allCachesSelected.value || selectedCaches[serviceWorkerRegistrations]) {
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
  @include color-ui-secondary;
  &[aria-checked='true'] {
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
}
</style>
