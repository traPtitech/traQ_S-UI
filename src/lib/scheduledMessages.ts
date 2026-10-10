import type { FileInfo } from '@traptitech/traq'

import axios from 'axios'
import type { AxiosProgressEvent } from 'axios'

import { BASE_PATH, buildFilePath } from '/@/lib/apis'
import { mimeToFileType } from '/@/lib/basic/file'
import type { Attachment } from '/@/store/ui/messageInputStateStore'
import type { ChannelId, FileId } from '/@/types/entity-ids'

export interface ScheduledMessage {
  id: string
  channelId: ChannelId
  content: string
  draftContent: string
  scheduledAt: string
  createdAt: string
  fileIds: FileId[]
  status: 'pending' | 'failed'
  failure: string
}

const path = `${BASE_PATH}/users/me/scheduled-messages`

export const scheduledMessageApis = {
  list: () => axios.get<ScheduledMessage[]>(path),
  create: (body: {
    channelId: ChannelId
    content: string
    draftContent: string
    scheduledAt: string
    fileIds: FileId[]
  }) => axios.post<ScheduledMessage>(path, body),
  cancel: (id: string) => axios.delete(`${path}/${id}`),
  upload: (
    file: File,
    channelId: ChannelId,
    onUploadProgress: (event: AxiosProgressEvent) => void
  ) => {
    const body = new FormData()
    body.append('file', file)
    body.append('channelId', channelId)
    return axios.post<FileInfo>(`${path}/files`, body, { onUploadProgress })
  }
}

/** Download before cancellation removes the private uploads. */
export const downloadScheduledAttachments = async (
  ids: FileId[]
): Promise<Attachment[]> =>
  Promise.all(
    ids.map(async id => {
      const [{ data: meta }, { data: blob }] = await Promise.all([
        axios.get<FileInfo>(`${buildFilePath(id)}/meta`),
        axios.get<Blob>(buildFilePath(id), { responseType: 'blob' })
      ])
      const file = new File([blob], meta.name, { type: meta.mime })
      return { file, type: mimeToFileType(file.type) }
    })
  )

export const toLocalDateTimeInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const scheduledMessageFailure = (failure: string) => {
  const reasons: Record<string, string> = {
    user_unavailable: '投稿者のアカウントがありません',
    user_inactive: '投稿者のアカウントが停止されています',
    permission_revoked: '投稿またはファイル添付の権限がありません',
    channel_unavailable: '送信先にアクセスできません',
    channel_archived: '送信先がアーカイブされています',
    attachment_unavailable: '添付ファイルが利用できません'
  }
  return reasons[failure] ?? '送信できませんでした'
}
