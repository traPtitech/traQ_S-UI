<template>
  <section>
    <profile-header text="ひとこと" :style="{ marginTop: 0 }" />
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
import ProfileHeader from './ProfileHeader.vue'

const useStyles = (lowPriority: Ref<boolean>) =>
  reactive({
    bio: makeStyles(theme => ({
      color: lowPriority.value ? theme.ui.tertiary : theme.ui.primary
    }))
  })

type Props = {
  bio?: string
}

export default defineComponent({
  name: 'Bio',
  props: {
    bio: String
  },
  setup(props: Props) {
    const isLoading = computed(() => props.bio === undefined)
    const isEmpty = computed(() =>
      props.bio === undefined ? false : props.bio === ''
    )
    const lowPriority = computed(() => isLoading.value || isEmpty.value)
    const styles = useStyles(lowPriority)

    return {
      styles,
      props,
      isLoading,
      isEmpty
    }
  },
  components: {
    ProfileHeader
  }
})
</script>
