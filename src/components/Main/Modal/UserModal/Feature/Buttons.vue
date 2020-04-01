<template>
  <div>
    <div @click="onDMClick" :style="{ display: 'inline-block' }">
      <link-button iconName="email" iconMdi />
    </div>
    <div
      v-if="homeChannelExists"
      @click="onHomeChannelClick"
      :style="{ display: 'inline-block' }"
    >
      <link-button title="ホーム" iconName="home" iconMdi />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import useHomeChannel from '../use/homeChannel'
import LinkButton from './LinkButton.vue'

type Props = {
  username: string
}

export default defineComponent({
  name: 'Buttons',
  props: {
    username: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const username = computed(() => props.username)
    const onDMClick = () => {
      // TODO: DM対応
      //store.dispatch.domain.messagesView.changeCurrentChannel(/* DM Channel */)
    }

    return {
      props,
      onDMClick,
      ...useHomeChannel(username)
    }
  },
  components: {
    LinkButton
  }
})
</script>
