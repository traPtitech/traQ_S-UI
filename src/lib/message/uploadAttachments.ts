import apis, { buildFilePathForPost } from '../apis'

export const uploadAttachments = async (
  files: readonly File[],
  channelId: string,
  onProgress: (progress: number) => void
) => {
  const urls: string[] = []

  for (const [index, file] of files.entries()) {
    const { data } = await apis.postFile(file, channelId, {
      onUploadProgress: event => {
        if (event.total)
          onProgress((index + event.loaded / event.total) / files.length)
      }
    })

    urls.push(buildFilePathForPost(data.id))
  }

  return urls
}
