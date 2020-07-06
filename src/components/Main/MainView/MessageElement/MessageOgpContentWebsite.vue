<template>
  <a :href="url" :class="$style.container" target="_blank">
    <div :class="$style.image" :style="styles.image" v-if="imageUrl"></div>
    <message-ogp-description
      :url="url"
      :title="title"
      :description="description"
    />
  </a>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import MessageOgpDescription from './MessageOgpDescription.vue'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { imageUrl?: string }) =>
  reactive({
    image: makeStyles(() => ({
      backgroundImage: props.imageUrl ? `url("${props.imageUrl}")` : ''
    }))
  })

export default defineComponent({
  name: 'MessageOgpContentWebSite',
  components: { MessageOgpDescription },
  props: {
    url: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  width: 500px;
  max-width: 100%;
}
.image {
  width: 10rem;
  flex-shrink: 0;
  flex-grow: 0;
  margin: {
    top: -1rem;
    bottom: -1rem;
    left: -1rem;
    right: 1rem;
  }
  background: {
    size: cover;
    repeat: no-repeat;
    position: center;
  }
}
</style>
