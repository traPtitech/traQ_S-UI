import store from '@/store'
import { Theme } from '@/types/theme'
import { computed } from '@vue/composition-api'
import * as CSS from 'csstype'
import { mdiBorderColor } from '@mdi/js'

type ThemeClaim = (theme: Theme) => CSS.Properties

export const makeStyles = (claim: ThemeClaim) => {
  return computed(() => claim(store.state.app.theme))
}
