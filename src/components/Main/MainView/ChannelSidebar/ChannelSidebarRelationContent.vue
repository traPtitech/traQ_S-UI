<template>
  <div>
    <div v-if="propst.parent" :class="$style.channel">
      <channel-sidebar-relation-element
        :name="propst.parent.name"
        :topic="propst.parent.topic"
        :link="buildParentLink()"
        :class="$style.element"
      />
    </div>
    <div
      v-if="propst.current"
      :class="$style.channel"
      :style="[propst.parent ? styles.firstBoarder : '']"
    >
      <channel-sidebar-relation-element
        is-current
        :name="propst.current.name"
        :topic="propst.current.topic"
        :class="$style.element"
      />
      <div
        :class="$style.channel"
        :style="[propst.parent ? styles.secondBoarder : styles.firstBoarder]"
      >
        <div v-for="(child, index) in propst.children" :key="child.id">
          <channel-sidebar-relation-element
            v-if="index < 3 || state.isOpenChildren"
            :name="child.name"
            :topic="child.topic"
            :link="buildChildLink(child.name)"
            :class="$style.element"
          />

          <div
            v-else-if="index === 3"
            :class="$style.text"
            @click="toggleChildren"
          >
            子チャンネルを全て表示(+{{ propst.children.length - 3 }})
          </div>
        </div>
      </div>
      <div v-for="(sibling, index) in propst.siblings" :key="sibling.id">
        <channel-sidebar-relation-element
          v-if="index < 3 || state.isOpenSiblings"
          :name="sibling.name"
          :topic="sibling.topic"
          :link="buildSiblingLink(sibling.name)"
          :class="$style.element"
        />
        <div
          v-else-if="index === 3"
          :class="$style.text"
          @click="toggleSiblings"
        >
          兄弟チャンネルを全て表示(+{{ propst.siblings.length - 3 }})
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import ChannelSidebarRelationElement from './ChannelSidebarRelationElement.vue'
import { makeStyles } from '@/lib/styles'
import { Channel } from '@traptitech/traq'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    current: makeStyles(theme => ({
      color: theme.accent.primary
    })),
    firstBoarder: makeStyles(theme => ({
      borderLeft: `solid ${theme.background.tertiary}`
    })),
    secondBoarder: makeStyles(theme => ({
      borderLeft: `solid ${theme.background.secondary}`
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarRelationContent',
  props: {
    parent: Object as PropType<Channel>,
    children: {
      type: Array as PropType<Channel[]>,
      default: []
    },
    siblings: {
      type: Array as PropType<Channel[]>,
      default: []
    },
    current: Object as PropType<Channel>
  },
  components: { ChannelSidebarRelationElement },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as {
      parent: Channel | undefined
      children: Channel[]
      siblings: Channel[]
      current: Channel | undefined
    }
    const styles = useStyles()
    const state = reactive({
      isOpenSiblings: false,
      isOpenChildren: false
    })
    const toggleChildren = () => {
      state.isOpenChildren = !state.isOpenChildren
    }
    const toggleSiblings = () => {
      state.isOpenSiblings = !state.isOpenSiblings
    }
    const buildChildLink = (channel: string) =>
      `${location.pathname}/${channel}`
    const buildParentLink = () =>
      `${location.pathname.split('/').slice(0, -1).join('/')}`
    const buildSiblingLink = (channel: string) =>
      `${location.pathname.split('/').slice(0, -1).join('/')}/${channel}`
    return {
      propst,
      styles,
      state,
      toggleChildren,
      toggleSiblings,
      buildChildLink,
      buildParentLink,
      buildSiblingLink
    }
  }
})
</script>

<style lang="scss" module>
$textSize: 0.95rem;

.channel {
  margin-left: 4px;
  padding-left: 12px;
  font-weight: bold;
  word-break: break-all;
  &:first-child {
    margin-left: 0px;
    padding-left: 0px;
  }
}

.element {
  // FIXME: 例外的に6px、あとでデザイン修正
  margin: 6px 0;
}

.text {
  font-size: $textSize;
  cursor: pointer;
}
</style>
