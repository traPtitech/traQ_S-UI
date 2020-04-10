<template>
  <div>
    <div @click="onDMClick" :style="{ display: 'inline-block' }">
      <link-button
        :title="`${showTitle ? 'DM' : ''}`"
        icon-name="email"
        icon-mdi
      />
    </div>
    <div
      v-if="homeChannelExists"
      @click="onHomeChannelClick"
      :style="{ display: 'inline-block' }"
    >
      <link-button
        :title="`${showTitle ? 'ホーム' : ''}`"
        icon-name="home"
        icon-mdi
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import useHomeChannel from '../use/homeChannel'
import LinkButton from './LinkButton.vue'

export default defineComponent({
  name: 'Buttons',
  props: {
    username: {
      type: String,
      required: true
    },
    showTitle: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const username = computed(() => props.username)
    const onDMClick = () => {
      // TODO: DM対応
      //store.dispatch.domain.messagesView.changeCurrentChannel(/* DM Channel */)
    }

    return {
      onDMClick,
      ...useHomeChannel(username)
    }
  },
  components: {
    LinkButton
  }
})
</script>
