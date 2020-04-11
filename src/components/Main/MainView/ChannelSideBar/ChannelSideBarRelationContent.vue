<template>
  <div>
    <div v-if="props.parent.name" :class="$style.channel">
      <channel-side-bar-relation-element
        :name="props.parent.name"
        :topic="props.parent.topic"
        :link="buildParentLink()"
      />
    </div>
    <div
      :class="$style.channel"
      :style="[props.parent.name ? styles.firstBoarder : '']"
    >
      <channel-side-bar-relation-element
        :isCurrent="true"
        :name="props.current.name"
        :topic="props.current.topic"
      />
      <div
        :class="$style.channel"
        :style="[
          props.parent.name ? styles.secondBoarder : styles.firstBoarder
        ]"
      >
        <div v-for="(child, index) in props.children" :key="child.id">
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
            子チャンネルを全て表示(+{{ props.children.length - 3 }})
          </div>
        </div>
      </div>
      <div v-for="(sister, index) in props.sisters" :key="sister.id">
        <channel-side-bar-relation-element
          v-if="index < 3 || state.isOpenSisters"
          :name="sister.name"
          :topic="sister.topic"
          :link="buildSisterLink(sister.name)"
        />
        <div
          v-else-if="index === 3"
          :class="$style.text"
          @click="toggleSisters"
        >
          兄弟チャンネルを全て表示(+{{ props.sisters.length - 3 }})
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import ChannelSideBarRelationElement from './ChannelSideBarRelationElement.vue'
import { makeStyles } from '@/lib/styles'
import { ChannelState } from './ChannelSideBarRelation.vue'

type Props = {
  parent: ChannelState
  children: ChannelState[]
  sisters: ChannelState[]
  current: ChannelState
}

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
    parent: { type: Object, required: true },
    children: { type: Array, required: true },
    sisters: { type: Array, required: true },
    current: { type: Object, required: true }
  },
  components: { ChannelSideBarRelationElement },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpenSisters: false,
      isOpenChildren: false
    })
    const toggleChildren = () => {
      state.isOpenChildren = !state.isOpenChildren
    }
    const toggleSisters = () => {
      state.isOpenSisters = !state.isOpenSisters
    }
    const buildChildLink = (channel: string | undefined) =>
      `${location.pathname}/${channel ?? ''}`
    const buildParentLink = () =>
      `${location.pathname.split('/').slice(0, -1).join('/')}`
    const buildSisterLink = (channel: string | undefined) =>
      `${location.pathname.split('/').slice(0, -1).join('/')}/${channel ?? ''}`
    return {
      props,
      styles,
      state,
      toggleChildren,
      toggleSisters,
      buildChildLink,
      buildParentLink,
      buildSisterLink
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
