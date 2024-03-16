<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <div :class="$style.checkboxContainer">
        <form-checkbox
          v-for="name in cacheNames"
          :key="name"
          v-model="cacheNameToIsSelected[name]"
          :class="$style.checkbox"
        >
          <div :class="$style.label">
            {{ cacheLabel(name) }}
            <span>{{ cacheSize[name] }}</span>
          </div>
        </form-checkbox>
      </div>
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

const cacheNames = [
  'workbox-precache-v2-https://q.trap.jp/',
  'files-cache',
  'thumbnail-cache'
] as const
type CacheName = (typeof cacheNames)[number]

const cacheNameToIsSelected = ref(
  Object.fromEntries(cacheNames.map(name => [name, false]))
)
const anyCacheSelected = computed(() => {
  return Object.values(cacheNameToIsSelected).includes(true)
})

const cacheSize = ref(Object.fromEntries(cacheNames.map(name => [name, ''])))

const updateCacheSize = async () => {
  await Promise.all(
    cacheNames.map(async name => {
      cacheSize.value[name] = prettifyFileSize(await calculateCacheSize(name))
    })
  )
}
onMounted(updateCacheSize)

const calculateCacheSize = async (cacheName: CacheName) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  let size = 0
  await Promise.all(
    keys.map(async key => {
      const response = await cache.match(key)
      if (!response) return
      const blob = await response.blob()
      size += blob.size
    })
  )
  return size
}

const cacheLabel = (cacheName: CacheName) => {
  switch (cacheName) {
    case 'workbox-precache-v2-https://q.trap.jp/':
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

const isClearingCache = ref(false)

// TODO: 名前の改善
const clearMainCache = async () => {
  const names = await window.caches.keys()
  return names
    .filter(name => name.startsWith('workbox-precache-v2-https://q.trap.jp/'))
    .map(name => {
      console.log(name)
      clearCacheStorage(name)
    })
}

// TODO: 処理を綺麗にできると嬉しい
const clearCache = async () => {
  if (isClearingCache.value || !confirmClear()) return
  isClearingCache.value = true
  const promises = []
  if (cacheNameToIsSelected.value['workbox-precache-v2-https://q.trap.jp/']) {
    promises.push(clearMainCache())
  }
  if (cacheNameToIsSelected.value['files-cache']) {
    promises.push(clearCacheStorage('files-cache'))
  }
  if (cacheNameToIsSelected.value['thumbnail-cache']) {
    promises.push(clearCacheStorage('thumbnail-cache'))
  }
  await Promise.all(promises.flat())
  if (!cacheNameToIsSelected.value['workbox-precache-v2-https://q.trap.jp/']) {
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
  showToast('1秒後にリロードします')
  await wait(1000)
  clearModal()
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
