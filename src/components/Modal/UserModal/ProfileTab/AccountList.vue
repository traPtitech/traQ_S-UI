<template>
  <section>
    <profile-header text="アカウント" />
    <p v-if="showWikiPageLink" :class="$style.p">
      <circle-icon
        title="wiki"
        name="crowi"
        :color="iconColor"
        :background="iconBackgroundColor"
        :class="$style.icon"
      />
      <a
        :href="wikiPageLink"
        rel="noopener noreferrer"
        target="_blank"
        @click.stop=""
        >{{ wikiPageName }}</a
      >
    </p>
    <p v-if="blogPageLink" :class="$style.p">
      <circle-icon
        title="ブログ"
        name="traP"
        :color="iconColor"
        :background="iconBackgroundColor"
        :class="$style.icon"
      />
      <a
        :href="blogPageLink"
        rel="noopener noreferrer"
        target="_blank"
        @click.stop=""
        >author/{{ name }}</a
      >
    </p>
    <p v-if="twitterId !== ''" :class="$style.p">
      <circle-icon
        title="𝕏"
        name="x"
        :color="iconColor"
        :background="iconBackgroundColor"
        :class="$style.icon"
      />
      <template v-if="twitterId === undefined">Now Loading...</template>
      <template v-else>
        <a
          :href="twitterLink"
          rel="noopener noreferrer"
          target="_blank"
          @click.stop=""
          >@{{ twitterId }}</a
        >
      </template>
    </p>
  </section>
</template>

<script lang="ts" setup>
import ProfileHeader from './ProfileHeader.vue'
import CircleIcon from '/@/components/UI/CircleIcon.vue'
import { computed } from 'vue'
import { useThemeSettings } from '/@/store/app/themeSettings'

const props = defineProps<{
  bot: boolean
  name: string
  twitterId?: string
}>()

const { currentTheme } = useThemeSettings()

const iconBackgroundColor = computed(
  () => currentTheme.value.basic.ui.primary.default
)
const iconColor = computed(
  () => currentTheme.value.basic.background.primary.border
)

const { wikiPageOrigin, blogPagePrefix } = window.traQConfig
const showWikiPageLink = wikiPageOrigin !== undefined
const wikiPageName = computed(() => {
  if (props.bot) {
    return `bot/${props.name.replace(/^BOT_/, '')}`
  }
  return `user/${props.name}`
})
const wikiPageLink = computed(() => `${wikiPageOrigin}/${wikiPageName.value}`)

const blogPageLink = computed(() => {
  if (blogPagePrefix === undefined) return null
  if (props.bot) return null
  return `${blogPagePrefix}${props.name}`
})

const twitterLink = computed(() => `https://x.com/${props.twitterId ?? ''}`)
</script>

<style lang="scss" module>
.p {
  margin: 8px 0;
}
.icon {
  margin-right: 8px;
  vertical-align: bottom;
}
</style>
