import {
  useNavigation,
  useEphemeralNavigation,
  EphemeralNavigationItemType
} from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

import { EphemeralNavigationSelectorEntry } from './useNavigationSelectorEntry'

const useNav = () => {
  const { navigationSelectorState, onNavigationChange } = useNavigation()
  const {
    navigationSelectorState: ephemeralNavigationSelectorState,
    onNavigationChange: _onEphemeralNavigationChange
  } = useEphemeralNavigation()

  // もう一度押すと消えて欲しいので一段階ラップ
  const onEphemeralNavigationChange = (type: EphemeralNavigationItemType) => {
    if (ephemeralNavigationSelectorState.currentNavigation === type) {
      _onEphemeralNavigationChange(undefined)
    } else {
      _onEphemeralNavigationChange(type)
    }
  }

  const onEphemeralEntryRemove = (entry: EphemeralNavigationSelectorEntry) => {
    if (entry.type === ephemeralNavigationSelectorState.currentNavigation) {
      _onEphemeralNavigationChange(undefined)
    }
  }

  const onEphemeralEntryAdd = (entry: EphemeralNavigationSelectorEntry) => {
    if (
      entry.selectOnAdd ||
      ephemeralNavigationSelectorState.currentNavigation === undefined
    ) {
      _onEphemeralNavigationChange(entry.type)
    }
  }

  return {
    navigationSelectorState,
    ephemeralNavigationSelectorState,
    onNavigationChange,
    onEphemeralNavigationChange,
    onEphemeralEntryRemove,
    onEphemeralEntryAdd
  }
}

export default useNav
