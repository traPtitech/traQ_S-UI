import useExecWithToast from '/@/composables/toast/useExecWithToast'

const useCopyText = () => {
  const { execWithToast } = useExecWithToast()

  const copyText = async (text: string, description?: string) => {
    if (description === undefined) {
      await execWithToast('コピーしました', 'コピーに失敗しました', () =>
        navigator.clipboard.writeText(text)
      )
    } else {
      await execWithToast(
        `${description}をコピーしました`,
        `${description}のコピーに失敗しました`,
        () => navigator.clipboard.writeText(text)
      )
    }
  }

  return { copyText }
}

export default useCopyText
