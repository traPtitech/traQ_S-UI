<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p :style="styles.text">
      <icon name="home" mdi :class="$style.icon" />
      <span
        v-if="homeChannelExists"
        :class="$style.channel"
        @click="onHomeChannelClick"
      >
        #gps/times/{{ props.name }}
      </span>
      <span v-else>存在しません</span>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, Ref, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import useHomeChannel from '../use/homeChannel'
import ProfileHeader from './ProfileHeader.vue'
import Icon from '@/components/UI/Icon.vue'
import { ChannelId } from '@/types/entity-ids'

const useStyles = (channelId: Ref<boolean>) =>
  reactive({
    text: makeStyles(theme => ({
      color: channelId.value ? theme.ui.primary : theme.ui.tertiary
    }))
  })

interface Props {
  name: string
}

export default defineComponent({
  name: 'HomeChannel',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const username = computed(() => props.name)
    const { homeChannelExists, onHomeChannelClick } = useHomeChannel(username)
    const styles = useStyles(homeChannelExists)

    return {
      styles,
      props,
      homeChannelExists,
      onHomeChannelClick
    }
  },
  components: {
    ProfileHeader,
    Icon
  }
})
</script>

<style lang="scss" module>
.icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}

.channel {
  cursor: pointer;
}
</style>
