<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <form-checkbox
        v-for="name in cacheNames"
        :key="name"
        v-model="cacheNameToIsSelected[name]"
        :class="$style.checkbox"
      >
        <div :class="$style.label">
          {{ cacheLabel(name) }}
          <span>{{ prettifyFileSize(cacheSize[name]) }}</span>
        </div>
      </form-checkbox>
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
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'
import { prettifyFileSize } from '/@/lib/basic/file'

declare global {
  interface StorageEstimate {
    usageDetails: Record<CacheName, number>
  }
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

type CacheName = 'traQ_S-precache' | 'files-cache' | 'thumbnail-cache'
const traqSPrecache = 'traQ_S-precache'
const filesCache = 'files-cache'
const thumbnailCache = 'thumbnail-cache'
const cacheNames: CacheName[] = [traqSPrecache, filesCache, thumbnailCache]

const cacheNameToIsSelected = ref<Record<CacheName, boolean>>({
  'traQ_S-precache': false,
  'files-cache': false,
  'thumbnail-cache': false
})
const anyCacheSelected = computed(() => {
  return Object.values(cacheNameToIsSelected).includes(true)
})

const cacheSize = ref<Record<CacheName, number>>({
  'traQ_S-precache': 0,
  'files-cache': 0,
  'thumbnail-cache': 0
})
onMounted(() => {
  updateCacheSize
})
const updateCacheSize = async () => {
  Promise.all(
    cacheNames.map(async name => {
      cacheSize.value[name] = await calculateCacheSize(name)
      return
    })
  )
}
const calculateCacheSize = async (cacheName: CacheName) => {
  const cache = await window.caches.open(cacheName)
  const responses = await cache.matchAll()
  const cacheSizes = await Promise.all(
    responses.map(async response => {
      const arrayBuffer = await response.arrayBuffer()
      return arrayBuffer.byteLength
    })
  )
  return cacheSizes.reduce((sum, size) => sum + size)
}

const cacheLabel = (cacheName: CacheName) => {
  switch (cacheName) {
    case 'traQ_S-precache':
      return 'traQ本体'
    case 'files-cache':
      return 'ファイルの本体一覧'
    case 'thumbnail-cache':
      return 'ファイルのサムネイル一覧'
    default:
      throw new Error(`Unknown cache name: ${cacheName satisfies CacheName}`)
  }
}

const { clearModal } = useModalStore()

const isClearingCache = ref<boolean>(false)

// TODO: 名前の改善
const clearMainCache = async () => {
  const names = await window.caches.keys()
  return names
    .filter(name => name.startsWith('traQ_S-precache'))
    .map(name => clearCacheStorage(name))
}

// TODO: 処理を綺麗にできると嬉しい
// TODO: promise周りの処理順の確認
// TODO: キャッシュの対応関係の確認
const clearCache = async () => {
  if (isClearingCache.value || !confirmClear()) return
  isClearingCache.value = true
  const promises = []
  if (cacheNameToIsSelected.value[traqSPrecache]) {
    promises.push(clearMainCache())
  }
  if (cacheNameToIsSelected.value[filesCache]) {
    promises.push(clearCacheStorage(filesCache))
  }
  if (cacheNameToIsSelected.value[thumbnailCache]) {
    promises.push(clearCacheStorage(thumbnailCache))
  }
  await Promise.all(promises.flat())
  if (!cacheNameToIsSelected.value[traqSPrecache]) {
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
