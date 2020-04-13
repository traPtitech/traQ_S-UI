<template>
  <div>
    <div v-if="propst.parent" :class="$style.channel">
      <channel-side-bar-relation-element
        :name="propst.parent.name"
        :topic="propst.parent.topic"
        :link="buildParentLink()"
      />
    </div>
    <div
      v-if="propst.current"
      :class="$style.channel"
      :style="[propst.parent ? styles.firstBoarder : '']"
    >
      <channel-side-bar-relation-element
        :is-current="true"
        :name="propst.current.name"
        :topic="propst.current.topic"
      />
      <div
        :class="$style.channel"
        :style="[propst.parent ? styles.secondBoarder : styles.firstBoarder]"
      >
        <div v-for="(child, index) in propst.children" :key="child.id">
          <channel-side-bar-relation-element
            v-if="index < 3 || state.isOpenChildren"
            :name="child.name"
            :topic="child.topic"
            :link="buildChildLink(child.name)"
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
        <channel-side-bar-relation-element
          v-if="index < 3 || state.isOpenSiblings"
          :name="sibling.name"
          :topic="sibling.topic"
          :link="buildSiblingLink(sibling.name)"
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
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import ChannelSideBarRelationElement from './ChannelSideBarRelationElement.vue'
import { makeStyles } from '@/lib/styles'
import { RelatedChannelEntry } from './use/useRelatedChannels'

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
  name: 'ChannelSideBarRelationContent',
  props: {
    parent: {
      type: Object as PropType<RelatedChannelEntry>
    },
    children: {
      type: Array as PropType<RelatedChannelEntry[]>,
      default: []
    },
    siblings: {
      type: Array as PropType<RelatedChannelEntry[]>,
      default: []
    },
    current: {
      type: Object as PropType<RelatedChannelEntry>
    }
  },
  components: { ChannelSideBarRelationElement },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst =
      props as
      {
        parent: RelatedChannelEntry | undefined
        children: RelatedChannelEntry[]
        siblings: RelatedChannelEntry[]
        current: RelatedChannelEntry | undefined
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
$channelSize: 1.15rem;
$textSize: 0.95rem;

.channel {
  font-size: $channelSize;
  margin-left: 4px;
  padding-left: 12px;
  font-weight: bold;
  word-break: break-all;
  &:first-child {
    margin-left: 0px;
    padding-left: 0px;
  }
}

.text {
  font-size: $textSize;
  cursor: pointer;
}
</style>
