<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DanmakuComment from './DanmakuComment.vue'

const comments = ref<{ id: string; markdown: string }[]>([])
const stamps = ref<{ id: string; stampId: string }[]>([])

onMounted(() => {
  // 一定間隔でコメントを生成
  setInterval(() => {
    comments.value.push({
      id: Math.random().toString(36).substring(2, 15),
      markdown: 'this is *comment*'
    })
    setTimeout(() => {
      comments.value.shift()
    }, 6000)
  }, 1000)
})
</script>

<template>
  <div :class="$style.danmakuContainer">
    <DanmakuComment
      v-for="comment in comments"
      :key="comment.id"
      :markdown="comment.markdown"
    />
  </div>
</template>

<style lang="scss" module>
.danmakuContainer {
  pointer-events: none;
  width: 100%;
  height: 100%; /* 適切な高さを設定 */
  position: absolute;
  bottom: 0;
  left: 0;
  overflow: hidden; /* 領域外のコメントを隠す */
}
</style>
