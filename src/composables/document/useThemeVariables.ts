import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { getThemeVariables } from '/@/lib/theme/variables'
import { useThemeSettings } from '/@/store/app/themeSettings'

export const useThemeVariables = (): ComputedRef<
  Record<`--${string}`, string>
> => {
  const { currentTheme } = useThemeSettings()
  return computed(() => getThemeVariables(currentTheme.value))
}
