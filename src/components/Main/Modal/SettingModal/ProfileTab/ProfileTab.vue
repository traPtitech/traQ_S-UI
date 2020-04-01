<template>
  <section :class="$style.container">
    <div>
      <h3>アイコン</h3>
      <p>TODO: アイコンアップロード</p>
    </div>
    <div>
      <h3>表示名</h3>
      <input type="text" v-model="state.displayName" />
    </div>
    <div>
      <h3>ひとこと</h3>
      <input type="text" v-model="state.bio" />
    </div>
    <div>
      <h3>Twitter</h3>
      <div :class="$style.twitterInput">
        <input type="text" v-model="state.twitterId" />
      </div>
    </div>
    <p>
      パスワードの変更は
      <a href="https://portal.trap.jp/" target="_blank">
        traPortal
      </a>
      から可能です
    </p>
    <button v-if="isChanged" @click="onUpdateClick">更新</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/api'

const createChange = <T extends Partial<UserDetail>>(
  state: Readonly<T>,
  storeState: Readonly<Ref<UserDetail | undefined>>
) => {
  const isChanged: Partial<Record<keyof T, boolean>> = {}
  for (const key of Object.keys(state)) {
    const k = key as keyof UserDetail

    isChanged[k] =
      storeState.value === undefined || state[k] !== storeState.value[k]
  }
  return isChanged as Record<keyof T, boolean>
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail)

    const state = reactive({
      displayName: detail.value?.displayName ?? '',
      bio: detail.value?.bio ?? '',
      twitterId: detail.value?.twitterId ?? ''
    })

    const isChangedState = computed(() => createChange(state, detail))
    const isChanged = computed(() =>
      [...Object.values(isChangedState.value)].some(val => val)
    )

    const onUpdateClick = () => {
      apis.editMe(state)
    }

    return { detail, state, isChanged, onUpdateClick }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}

.twitterInput {
  &::before {
    content: '@';
  }
}
</style>
