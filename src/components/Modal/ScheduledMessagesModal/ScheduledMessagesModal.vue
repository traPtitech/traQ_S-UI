<template>
  <ModalFrame
    title="予約投稿"
    subtitle="投稿されるまで、内容と添付は自分だけに見えます"
    icon-name="clock-outline"
    icon-mdi
  >
    <section v-if="!isEmpty" :class="$style.section">
      <h3>この下書きを予約する</h3>
      <p>{{ destination(channelId) }}</p>
      <MessageInputPreview :channel-id="channelId" :text="draft.text" />
      <p v-if="draft.attachments.length">
        添付 {{ draft.attachments.length }} 件
      </p>
      <FormInput
        v-model="scheduledAt"
        type="datetime-local"
        label="投稿日時"
        :min="toLocalDateTimeInput(new Date(now))"
        step="60"
        focus-on-mount
      />
      <p :class="$style.hint">
        {{ timeZone }} ·
        サーバーの停止中に時刻を過ぎた場合は、復旧後に投稿します
      </p>
      <MessageInputUploadProgress v-if="isPosting" :progress="progress" />
      <FormButton
        label="予約する"
        :loading="isPosting"
        :disabled="!canSchedule"
        data-testid="schedule-submit"
        @click="schedule"
      />
    </section>
    <section :class="$style.section">
      <div :class="$style.heading">
        <h3>自分の予約（{{ messages.length }} / 100）</h3>
        <button :disabled="loading || busy" @click="load">更新</button>
      </div>
      <p v-if="loadError" role="alert">{{ loadError }}</p>
      <p v-else-if="loading && !loaded">読み込み中…</p>
      <p v-else-if="loaded && !messages.length">
        予約はありません。入力欄でメッセージを作成してから予約できます。
      </p>
      <article
        v-for="message in messages"
        :key="message.id"
        :class="$style.reservation"
        :data-status="message.status"
        data-testid="scheduled-message"
      >
        <div>{{ destination(message.channelId) }}</div>
        <time :datetime="message.scheduledAt">{{
          new Date(message.scheduledAt).toLocaleString()
        }}</time>
        <p
          v-if="message.status === 'failed'"
          :class="$style.error"
          role="status"
        >
          送信失敗：{{ scheduledMessageFailure(message.failure) }}
        </p>
        <p
          v-else-if="new Date(message.scheduledAt).getTime() <= now"
          :class="$style.hint"
        >
          送信待ち
        </p>
        <MessageInputPreview
          :channel-id="message.channelId"
          :text="message.content"
        />
        <MessageFileList
          v-if="message.fileIds.length"
          :channel-id="message.channelId"
          :file-ids="message.fileIds"
        />
        <div :class="$style.actions">
          <FormButton
            label="下書きに戻す"
            type="secondary"
            :disabled="busy || isPosting || !destinationLink(message.channelId)"
            @click="restore(message)"
          />
          <FormButton
            label="予約を削除"
            type="secondary"
            is-danger
            :disabled="busy || isPosting"
            @click="remove(message)"
          />
        </div>
      </article>
    </section>
  </ModalFrame>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import axios from 'axios'

import MessageFileList from '/@/components/Main/MainView/MessageElement/Embeddings/MessageFileList.vue'
import MessageInputPreview from '/@/components/Main/MainView/MessageInput/MessageInputPreview.vue'
import MessageInputUploadProgress from '/@/components/Main/MainView/MessageInput/MessageInputUploadProgress.vue'
import usePostMessage from '/@/components/Main/MainView/MessageInput/composables/usePostMessage'
import FormButton from '/@/components/UI/FormButton.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import useChannelPath from '/@/composables/useChannelPath'
import {
  downloadScheduledAttachments,
  scheduledMessageApis,
  scheduledMessageFailure,
  toLocalDateTimeInput
} from '/@/lib/scheduledMessages'
import type { ScheduledMessage } from '/@/lib/scheduledMessages'
import router from '/@/router'
import { useMessagesStore } from '/@/store/entities/messages'
import {
  createDefaultValue,
  useMessageInputStateStore
} from '/@/store/ui/messageInputStateStore'
import { useModalStore } from '/@/store/ui/modal'
import { useToastStore } from '/@/store/ui/toast'
import type { ChannelId } from '/@/types/entity-ids'

import ModalFrame from '../Common/ModalFrame.vue'

const { channelId } = defineProps<{ channelId: ChannelId }>()
const { getStore, setStore, postingChannels } = useMessageInputStateStore()
const { fetchFileMetaData } = useMessagesStore()
const draft = computed(() => getStore(channelId) ?? createDefaultValue())
const isEmpty = computed(
  () => !draft.value.text && !draft.value.attachments.length
)
const { scheduleMessage, isPosting, progress } = usePostMessage(channelId)
const { channelIdToPathString, channelIdToLink } = useChannelPath()
const { clearModal } = useModalStore()
const { addErrorToast, addSuccessToast } = useToastStore()
const destination = (id: ChannelId) => {
  try {
    return channelIdToPathString(id, true) ?? '送信先を読み込み中'
  } catch {
    return '利用できない送信先'
  }
}
const destinationLink = (id: ChannelId) => {
  try {
    return channelIdToLink(id)
  } catch {
    return null
  }
}
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const now = ref(Date.now())
const scheduledAt = ref(
  toLocalDateTimeInput(new Date(Date.now() + 15 * 60 * 1000))
)
const messages = ref<ScheduledMessage[]>([])
const loading = ref(false)
const loaded = ref(false)
const busy = ref(false)
const loadError = ref('')
let requestVersion = 0
let active = true
const restoredIds = new Set<string>()
const canSchedule = computed(
  () =>
    !busy.value &&
    loaded.value &&
    !loadError.value &&
    !isEmpty.value &&
    messages.value.length < 100 &&
    new Date(scheduledAt.value).getTime() > now.value
)

const load = async () => {
  if (!active || loading.value || busy.value) return
  loading.value = true
  const version = ++requestVersion
  try {
    const { data } = await scheduledMessageApis.list()
    if (version !== requestVersion) return
    messages.value = data
    loaded.value = true
    loadError.value = ''
    await Promise.allSettled(
      data.flatMap(message =>
        message.fileIds.map(fileId => fetchFileMetaData({ fileId }))
      )
    )
  } catch (e) {
    if (version !== requestVersion) return
    loadError.value =
      axios.isAxiosError(e) && e.response?.status === 404
        ? 'このサーバーは予約投稿に対応していません'
        : '予約を取得できませんでした。更新して再試行してください'
  } finally {
    loading.value = false
  }
}
const schedule = async () => {
  if (!canSchedule.value || isPosting.value) return
  await scheduleMessage(new Date(scheduledAt.value).toISOString())
  await load()
}
const cancellationError = (e: unknown) => {
  addErrorToast(
    axios.isAxiosError(e) &&
      (e.response?.status === 409 || e.response?.status === 404)
      ? 'すでに送信または取り消しされています。予約一覧を確認してください'
      : '予約を取り消せませんでした'
  )
}
const remove = async (message: ScheduledMessage) => {
  if (busy.value || isPosting.value) return
  if (!confirm('この予約を削除しますか？ 本文と添付は下書きに戻りません。'))
    return
  busy.value = true
  requestVersion++
  try {
    await scheduledMessageApis.cancel(message.id)
    messages.value = messages.value.filter(m => m.id !== message.id)
    addSuccessToast('予約を削除しました')
  } catch (e) {
    cancellationError(e)
  } finally {
    busy.value = false
    await load()
  }
}
const restore = async (message: ScheduledMessage) => {
  if (busy.value || isPosting.value) return
  if (postingChannels.value.has(message.channelId)) {
    addErrorToast('送信処理が終わってから下書きに戻してください')
    return
  }
  busy.value = true
  requestVersion++
  // Keep the destination composer locked while downloading and canceling.
  postingChannels.value.add(message.channelId)
  try {
    const attachments = await downloadScheduledAttachments(message.fileIds)
    const saveDraft = () => {
      if (restoredIds.has(message.id)) return
      const existing = getStore(message.channelId) ?? createDefaultValue()
      setStore(message.channelId, {
        text: [existing.text, message.draftContent]
          .filter(Boolean)
          .join('\n\n'),
        attachments: [...existing.attachments, ...attachments]
      })
      restoredIds.add(message.id)
    }
    try {
      await scheduledMessageApis.cancel(message.id)
    } catch (e) {
      // If the response was lost, cancellation may already have removed the
      // uploads. Preserve downloaded data, without claiming cancellation succeeded.
      if (!axios.isAxiosError(e) || !e.response) {
        saveDraft()
        addErrorToast(
          '取消の結果を確認できません。本文と添付は下書きに保存しました。送信前に予約一覧を確認してください'
        )
        return
      }
      throw e
    }
    messages.value = messages.value.filter(m => m.id !== message.id)
    saveDraft()
    addSuccessToast('予約を取り消し、下書きに戻しました')
    if (active) {
      await clearModal()
      const link = destinationLink(message.channelId)
      if (link) await router.push(link)
    }
  } catch (e) {
    cancellationError(e)
  } finally {
    postingChannels.value.delete(message.channelId)
    busy.value = false
    await load()
  }
}
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  void load()
  timer = setInterval(() => {
    now.value = Date.now()
    if (document.visibilityState === 'visible') void load()
  }, 5000)
})
onUnmounted(() => {
  active = false
  requestVersion++
  clearInterval(timer)
})
</script>

<style lang="scss" module>
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  & + & {
    margin-top: 24px;
  }
}
.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.heading button {
  @include color-accent-primary;
  cursor: pointer;
}
.hint {
  @include color-ui-secondary;
  font-size: 12px;
}
.reservation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid $theme-background-secondary-border;
  padding-top: 12px;
  overflow-wrap: anywhere;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.error {
  color: $theme-accent-error-default;
}
</style>
