<template>
  <section :class="$style.container">
    <div>
      <h3>アイコン</h3>
      <user-icon :userId="detail.id" :size="100" :preventModal="true" />
      <image-upload @input="onImgSet" rounded />
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
import {
  defineComponent,
  computed,
  reactive,
  Ref,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/api'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '../ImageUpload.vue'

const isAnyChanged = <T extends Partial<UserDetail>>(
  state: Readonly<T>,
  storeState: Readonly<Ref<UserDetail>>
): boolean => {
  return Object.keys(state).some(key => {
    const k = key as keyof UserDetail
    return storeState.value[k] === undefined || state[k] !== storeState.value[k]
  })
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail!)

    const state = reactive({
      displayName: detail.value.displayName ?? '',
      bio: detail.value.bio ?? '',
      twitterId: detail.value.twitterId ?? ''
    })
    const isStateChanged = computed(() => isAnyChanged(state, detail))

    const imgData = ref<Blob>()
    const onImgSet = (file: Blob) => {
      imgData.value = file
    }

    const isChanged = computed(
      () => isStateChanged.value || imgData.value !== undefined
    )
    const onUpdateClick = async () => {
      const promises = []
      if (imgData.value !== undefined) {
        promises.push(apis.changeUserIcon(detail.value.id, imgData.value))
      }
      if (isStateChanged.value) {
        promises.push(apis.editMe(state))
      }
      try {
        await Promise.all(promises)
      } catch (e) {
        console.error(e)
      }
    }

    return { detail, state, isStateChanged, onImgSet, isChanged, onUpdateClick }
  },
  components: {
    UserIcon,
    ImageUpload
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
