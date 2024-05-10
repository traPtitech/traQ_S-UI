<template>
  <div>
    <h3 :class="$style.header">キャッシュ</h3>
    <div>
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
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { checkStorageManagerSupport } from '/@/lib/dom/browser'
import { prettifyFileSize } from '/@/lib/basic/file'

const isStorageManagerSupported = checkStorageManagerSupport()
const getStorageUsage = async () => {
  if (!isStorageManagerSupported) return null

  return navigator.storage.estimate()
}
</script>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'

const cacheData = ref<StorageEstimate | null>(null)
const setCacheData = async () => {
  cacheData.value = await getStorageUsage()
}
onMounted(setCacheData)

const { pushModal } = useModalStore()
const openClearCacheModal = async () => {
  pushModal({
    type: 'settings-cache-clear'
  })
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.usage {
  margin-bottom: 8px;
}
.button {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
