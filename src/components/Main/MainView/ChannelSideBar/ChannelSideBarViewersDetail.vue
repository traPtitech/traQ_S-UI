<template>
  <channel-side-bar-content title="閲覧者" @click="closeDetail">
    <template #content>
      <user-icon v-for="id in viewerIds" :key="id" :user-id="id" :size="40" />
    </template>
  </channel-side-bar-content>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'
import ChannelSideBarContent from './ChannelSideBarContent.vue'

export default defineComponent({
  name: 'ChannelSideBarViewerDetail',
  components: { UserIcon, ChannelSideBarContent },
  props: { viewerIds: { type: Array as PropType<UserId[]>, default: [] } },
  setup(_, context) {
    const closeDetail = () => {
      context.emit('close')
    }
    return { closeDetail }
  }
})
</script>
