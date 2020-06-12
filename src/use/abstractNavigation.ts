import { reactive, SetupContext, UnwrapRef } from '@vue/composition-api'

const createNavigation = <NavigationItemType extends string | undefined>(
  defaultItem: NavigationItemType,
  navigationChangeEvent = 'navigation-change'
) => {
  const useNavigation = () => {
    const navigationSelectorState = reactive({
      currentNavigation: defaultItem
    })
    const onNavigationChange = (type: NavigationItemType) => {
      navigationSelectorState.currentNavigation = type as UnwrapRef<
        NavigationItemType
      >
    }
    return {
      navigationSelectorState,
      onNavigationChange
    }
  }

  const useNavigationSelectorItem = (context: SetupContext) => {
    const onNavigationItemClick = (type: NavigationItemType) => {
      context.emit(navigationChangeEvent, type)
    }
    return {
      onNavigationItemClick
    }
  }

  return {
    useNavigation,
    useNavigationSelectorItem
  }
}

export default createNavigation
