import { computed, readonly, Ref, ref, unref, watchEffect } from 'vue'
import apis from '/@/lib/apis'
import { Version } from '@traptitech/traq'

const useVersion = (needed: Ref<boolean> | boolean = true) => {
  const version = ref<Version>()
  const externalLogin = computed(
    () => new Set(version.value?.flags.externalLogin ?? [])
  )
  const signUpAllowed = computed(() => version.value?.flags.signUpAllowed)

  const fetch = async () => {
    const res = await apis.getServerVersion()
    version.value = res.data
  }
  watchEffect(() => {
    if (unref(needed) && !version.value) {
      fetch()
    }
  })

  return {
    version: readonly(version),
    externalLogin,
    signUpAllowed
  }
}

export default useVersion
