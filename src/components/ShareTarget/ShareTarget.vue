<template>
  <div :class="$style.container" :data-is-mobile="isMobile">
    <authenticate-header :class="$style.header" title="シェア" />
    <share-target-form
      v-if="!donePost"
      :class="$style.form"
      :default-text="defaultText"
      @post="onPost"
    />
    <div v-else>投稿しました。1秒後にウィンドウを閉じます。</div>
    <portal-target
      :class="$style.stampPickerLocator"
      :name="targetPortalName"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue'
import ShareTargetForm from './ShareTargetForm.vue'
import store from '@/store'
import AuthenticateHeader from '@/components/Authenticate/AuthenticateHeader.vue'
import useIsMobile from '@/use/isMobile'
import { targetPortalName } from './ShareTargetMessageInput.vue'

export default defineComponent({
  name: 'ShareTarget',
  components: {
    AuthenticateHeader,
    ShareTargetForm
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const defaultText = computed(() =>
      [props.title, props.text, props.url]
        .filter(text => text !== '')
        .join('\n')
    )
    const { isMobile } = useIsMobile()

    const donePost = ref(false)
    const onPost = () => {
      donePost.value = true
    }
    watchEffect(() => {
      if (donePost.value) {
        setTimeout(() => {
          window.close()
        }, 1000)
      }
    })

    // メッセージの投稿に必要
    Promise.all([
      store.dispatch.entities.fetchChannels(),
      store.dispatch.entities.fetchUsers(),
      store.dispatch.entities.fetchUserGroups(),
      store.dispatch.entities.fetchStamps(),
      store.dispatch.domain.stampCategory.constructStampCategories(),
      store.dispatch.entities.fetchStampPalettes(),
      store.dispatch.domain.me.fetchStampHistory()
    ])

    return { defaultText, isMobile, donePost, onPost, targetPortalName }
  }
})
</script>

<style lang="scss" module>
$padding: 48px;

.container {
  @include color-text-primary;
  @include background-primary;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  width: 100%;
  max-width: 480px;
  min-height: 100%;
  padding: $padding;
  margin: auto;
  &[data-is-mobile] {
    padding: 16px;
  }
}
.header {
  margin-bottom: 24px;
  .container[data-is-mobile] & {
    margin-bottom: 16px;
  }
}
.form {
  flex: 1;
}

.stampPickerLocator {
  position: absolute;
  top: 0;
  right: $padding + 16px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  z-index: $z-index-stamp-picker;
  .container[data-is-mobile] & {
    top: -$padding;
    right: -24px;
    width: 100vw;
    padding: 0 8px;
  }
}
</style>
