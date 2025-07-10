export interface Props {
  type?: string
  modelValue?: string | number
  onSecondary?: boolean
  placeholder?: string
  name?: string
  autocomplete?: string
  label?: string
  prefix?: string
  suffix?: string
  min?: string
  max?: string
  step?: string
  maxLength?: number
  useChangeEvent?: boolean
  focusOnMount?: boolean
  selectOnFocus?: boolean
}

export const defaultProps: Props = {
  type: 'text',
  modelValue: '',
  onSecondary: false,
  placeholder: '',
  useChangeEvent: false,
  focusOnMount: false,
  selectOnFocus: false
}
