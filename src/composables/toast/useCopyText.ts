import useExecWithToast from '/@/composables/toast/useExecWithToast'

const useCopyText = () => {
  const { execWithToast } = useExecWithToast()

  const copyText = async (text: string) => {
    await execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(text)
    )
  }

  return { copyText }
}

export default useCopyText
