import 'vuex'
import * as Root from '@/store/root/type'

declare module 'vuex' {
  type RootState = Root.S & {}
  type RootGetters = Root.RG
  type RootMutations = Root.RM
  type RootActions = Root.RA
}
