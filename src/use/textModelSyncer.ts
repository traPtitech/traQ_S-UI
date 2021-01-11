import { SetupContext } from 'vue'
import useModelSyncer from './modelSyncer'

/**
 * > For languages that require an IME, you'll notice that v-model doesn't get updated during IME composition.
 * > https://v3.vuejs.org/guide/forms.html#basic-usage
 *
 * なので変換イベントも検知するようにする
 */
const useTextModelSyncer = (
  props: { modelValue: string },
  context:
    | SetupContext<{ 'update:modelValue': (val: string) => boolean }>
    | SetupContext<Record<string, unknown>>,
  onUpdate?: (val: string) => void
) => {
  const value = useModelSyncer(props, context, onUpdate)
  const onComposition = (e: CompositionEvent) => {
    onUpdate?.(e.data)
    context.emit('update:modelValue', value.value)
  }

  return { value, onComposition }
}

export default useTextModelSyncer
