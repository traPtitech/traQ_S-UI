<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import DanmakuComment from './DanmakuComment.vue'
import DanmakuStamp from './DanmakuStamp.vue'

import party from 'party-js'
import { useDanmakuSparkle } from './useDanmakuSparkle'
import { useQall } from '/@/composables/qall/useQall'

import { messageMitt } from '/@/store/entities/messages'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import useMittListener from '/@/composables/utils/useMittListener'

const { callingChannel, publishData, qallMitt } = useQall()

const comments = ref<{ id: string; markdown: string }[]>([])
const stamps = ref<{ id: string; stampId: string }[]>([])
const danmakuContainer = useTemplateRef<HTMLDivElement>('danmakuContainer')

const showSparkle = (stampElement: HTMLElement) => {
  if (!danmakuContainer.value) return
  const source = party.sources.elementSource(danmakuContainer.value)()
  const rect = new party.Rect(source.x, source.y, source.x, source.y)
  party.confetti(rect, {
    count: party.variation.range(100, 100),
    size: 2,
    shapes: stampElement
  })
}

messageMitt.on('addMessage', ({ message }) => {
  if (message.channelId !== callingChannel.value) return

  comments.value.push({
    id: message.id,
    markdown: message.content
  })
  setTimeout(() => {
    comments.value = comments.value.filter(v => v.id !== message.id)
  }, 6000)
})

messageMitt.on('deleteMessage', messageId => {
  comments.value = comments.value.filter(v => v.id !== messageId)
})

messageMitt.on('updateMessage', async message => {
  if (message.channelId !== callingChannel.value) return
  comments.value = comments.value.filter(v => v.id !== message.id)
  await nextTick()
  comments.value.push({
    id: message.id,
    markdown: message.content
  })
  setTimeout(() => {
    comments.value = comments.value.filter(v => v.id !== message.id)
  }, 6000)
})

const { toggleStampPicker } = useStampPickerInvoker(
  async stampData => {
    try {
      await publishData({ type: 'stamp', message: stampData.id })
      qallMitt.emit('pushStamp', stampData.id)
    } catch (e) {}
  },
  danmakuContainer,
  false,
  'bottom-right'
)

useMittListener(qallMitt, 'pushStamp', stamp => {
  sparkle(stamp)
})

const { sparkle } = useDanmakuSparkle(showSparkle)

onMounted(() => {
  // 一定間隔でコメントを生成
  setInterval(() => {
    comments.value.push({
      id: Math.random().toString(36).substring(2, 15),
      markdown: 'うおおおおおおおおおお!:tada::tada.party::tada.parrot:'
    })
    setTimeout(() => {
      comments.value.shift()
    }, 6000)
  }, 1000)

  setInterval(() => {
    stamps.value.push({
      id: Math.random().toString(36).substring(2, 15),
      stampId: '69c10725-2176-45ac-a4a5-22e70b8a76f7'
    })
    setTimeout(() => {
      stamps.value.shift()
    }, 1400)
  }, 1000)

  setInterval(() => {
    sparkle('e0e0c3a6-c544-4c96-8529-d597563fd1ad')
  }, 5000)
})
</script>

<template>
  <div ref="danmakuContainer" :class="$style.danmakuContainer">
    <button :style="{ pointerEvents: 'auto' }" @click="toggleStampPicker">
      スタンプピッカー
    </button>
    <DanmakuComment
      v-for="comment in comments"
      :key="comment.id"
      :markdown="comment.markdown"
    />
    <DanmakuStamp
      v-for="stamp in stamps"
      :key="stamp.id"
      :stamp-id="stamp.stampId"
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
