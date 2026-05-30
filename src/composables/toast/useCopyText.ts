import useExecWithToast from '/@/composables/toast/useExecWithToast'

const useCopyText = () => {
  const { execWithToast } = useExecWithToast()

  const copyText = async (text: string, description?: string) => {
    const type = 'text/plain'
    const blob = new Blob([text], { type })
    const data = new ClipboardItem({ [type]: blob })

    if (description === undefined) {
      await execWithToast('コピーしました', 'コピーに失敗しました', () =>
        navigator.clipboard.write([data])
      )
    } else {
      await execWithToast(
        `${description}をコピーしました`,
        `${description}のコピーに失敗しました`,
        () => navigator.clipboard.write([data])
      )
    }
  }

  return { copyText }
}

export default useCopyText
