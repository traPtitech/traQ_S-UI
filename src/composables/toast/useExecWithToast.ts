import { useToastStore } from '/@/store/ui/toast'
import type { MaybePromise } from '/@/types/utility'

const useExecWithToast = () => {
  const { addInfoToast, addErrorToast } = useToastStore()

  const execWithToast = async (
    successText: string | undefined,
    errorText: string,
    func: () => MaybePromise<void>
  ) => {
    try {
      await func()
      if (successText) {
        addInfoToast(successText)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(errorText, e)

      addErrorToast(errorText)
    }
  }

  return { execWithToast }
}

export default useExecWithToast
