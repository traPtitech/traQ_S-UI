import { reactive, UnwrapRef } from 'vue'

const createNavigation = <
  NavigationItemType extends string | undefined,
  NavigationChangeEvent extends string
>(
  defaultItem: NavigationItemType,
  navigationChangeEvent: NavigationChangeEvent
) => {
  const useNavigation = () => {
    const navigationSelectorState = reactive({
      currentNavigation: defaultItem
    })
    const onNavigationChange = (type: NavigationItemType) => {
      navigationSelectorState.currentNavigation =
        type as UnwrapRef<NavigationItemType>
    }
    return {
      navigationSelectorState,
      onNavigationChange
    }
  }

  const useNavigationSelectorItem = (
    emit: (event: NavigationChangeEvent, type: NavigationItemType) => void
  ) => {
    const onNavigationItemClick = (type: NavigationItemType) => {
      emit(navigationChangeEvent, type)
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
