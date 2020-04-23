import { computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import * as CSS from 'csstype'

const useHeaderColor = () => {
  const headerStyle = computed(() => store.getters.ui.mainView.headerStyle)
  const stylesWithColor = (style: CSS.Properties) =>
    makeStyles((theme, common) => ({
      ...style,
      color:
        headerStyle.value === 'dark'
          ? common.text.whitePrimary
          : theme.ui.primary
    }))
  return { headerStyle, stylesWithColor }
}

export default useHeaderColor
