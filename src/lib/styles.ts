import store from '@/store'
import { Theme } from '@/types/theme'
import { computed } from '@vue/composition-api'

interface Styles {
  [property: string]: string
}

type themeClaim = (theme: Theme) => Styles

export const makeStyles = (claim: themeClaim) => {
  return computed(() => claim(store.state.app.theme))
}
