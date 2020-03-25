<template>
  <section>
    <profile-tab-header text="ひとこと" :style="{ marginTop: 0 }" />
    <p :style="styles.bio">
      <template v-if="isLoading">[Now loading...]</template>
      <template v-else-if="isEmpty">[No bio]</template>
      <template v-else>{{ props.bio }}</template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import ProfileTabHeader from './ProfileTabHeader.vue'

const useStyles = (lowPriority: Ref<boolean>) =>
  reactive({
    bio: makeStyles(theme => ({
      color: lowPriority ? theme.ui.tertiary : theme.ui.primary
    }))
  })

interface Props {
  bio?: string
}

export default defineComponent({
  name: 'ProfileTabBio',
  props: {
    bio: String
  },
  setup(props: Props) {
    const isLoading = computed(() => props.bio === undefined)
    const isEmpty = computed(() =>
      props.bio === undefined ? false : props.bio === ''
    )
    const lowPriority = computed(() => isLoading.value && isEmpty.value)
    const styles = useStyles(lowPriority)

    return {
      styles,
      props,
      isLoading,
      isEmpty
    }
  },
  components: {
    ProfileTabHeader
  }
})
</script>

<style lang="scss" module></style>
