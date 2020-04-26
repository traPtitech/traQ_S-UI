<template>
  <section>
    <div :class="$style.element">
      <h3>アイコン</h3>
      <user-icon
        :user-id="detail.id"
        :size="100"
        :prevent-modal="true"
        :class="$style.icon"
      />
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
        rounded
        :class="$style.uploder"
      />
    </div>
    <div :class="$style.element">
      <h3>表示名</h3>
      <form-input v-model="state.displayName" :class="$style.form" />
    </div>
    <div :class="$style.element">
      <h3>ひとこと</h3>
      <form-input v-model="state.bio" :class="$style.form" />
    </div>
    <div :class="$style.element">
      <h3>ホームチャンネル</h3>
      <form-selector
        v-model="homeChannelState"
        :options="channelOptions"
        :class="$style.form"
      />
    </div>
    <div :class="$style.element">
      <h3>Twitter</h3>
      <form-input v-model="state.twitterId" prefix="@" :class="$style.form" />
    </div>
    <p>
      パスワードの変更は
      <a href="https://portal.trap.jp/" target="_blank">
        traPortal
      </a>
      から可能です
    </p>
    <div :class="$style.updater">
      <form-button label="更新" :disabled="!isChanged" @click="onUpdateClick" />
    </div>
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
import apis from '@/lib/apis'
import useStateDiff from '../use/stateDiff'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '../ImageUpload.vue'
import useImageUpload from '../use/imageUpload'
import useChannelPath from '@/use/channelPath'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { nullUuid } from '@/lib/util/uuid'

const useChannelOptions = () => {
  const { channelIdToPathString } = useChannelPath()
  return computed(() =>
    [
      {
        key: '--未設定--',
        value: nullUuid
      }
    ].concat(
      Object.values(store.state.entities.channels)
        .map(channel => ({
          key: channelIdToPathString(channel.id, true),
          value: channel.id
        }))
        .sort((a, b) => (a.key > b.key ? 1 : -1))
    )
  )
}

const useState = (detail: Ref<UserDetail>) => {
  const state = reactive({
    displayName: detail.value.displayName,
    bio: detail.value.bio,
    twitterId: detail.value.twitterId
  })
  const homeChannelState = ref(detail.value.homeChannel ?? nullUuid)
  const isHomeChannelChanged = computed(
    () =>
      homeChannelState.value !== detail.value.homeChannel &&
      !(
        homeChannelState.value === nullUuid && detail.value.homeChannel === null
      )
  )

  const { hasDiff } = useStateDiff<UserDetail>()
  const isStateChanged = computed(
    () => hasDiff(state, detail) || isHomeChannelChanged.value
  )

  return { state, homeChannelState, isStateChanged }
}

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail!)

    const channelOptions = useChannelOptions()

    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const { state, homeChannelState, isStateChanged } = useState(detail)

    const isChanged = computed(
      () => isStateChanged.value || imageUploadState.imgData !== undefined
    )
    const onUpdateClick = async () => {
      const promises = []
      if (imageUploadState.imgData !== undefined) {
        promises.push(
          apis.changeUserIcon(detail.value.id, imageUploadState.imgData)
        )
      }
      if (isStateChanged.value) {
        promises.push(
          apis.editMe({
            ...state,
            homeChannel: homeChannelState.value
          })
        )
      }
      try {
        // TODO: loading
        await Promise.all(promises)
        destroyImageUploadState()
      } catch (e) {
        // TODO: error
      }
    }

    return {
      detail,
      channelOptions,
      state,
      homeChannelState,
      imageUploadState,
      onNewImgSet,
      onNewDestroyed,
      isChanged,
      onUpdateClick
    }
  },
  components: {
    UserIcon,
    ImageUpload,
    FormInput,
    FormSelector,
    FormButton
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
h3 {
  margin-bottom: 8px;
}
.form {
  margin-left: 12px;
}
.icon {
  margin: {
    bottom: 8px;
    left: 36px;
  }
}
.uploder {
  margin-left: 12px;
}
.updater {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
