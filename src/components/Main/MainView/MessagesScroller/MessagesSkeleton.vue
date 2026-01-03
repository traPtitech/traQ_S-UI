<template>
  <div :class="$style.container">
    <div
      v-for="i in 7"
      :key="i"
      :class="$style.messageItem"
      :style="{ animationDelay: `${(7 - i) * 30}ms` }"
    >
      <div :class="$style.avatar" />
      <div :class="$style.content">
        <div :class="$style.header">
          <div :class="[$style.skeleton, $style.name]" />
          <div :class="[$style.skeleton, $style.time]" />
        </div>
        <div :class="[$style.skeleton, $style.text, $style.textLong]" />
        <div :class="[$style.skeleton, $style.text, $style.textShort]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  height: 100%;
  justify-content: flex-end;
}

.messageItem {
  display: flex;
  padding-block: 8px;
  gap: 8px;
  animation: fadeIn 0.3s ease-in-out forwards;
  opacity: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--specific-skeleton-background, rgba(128, 128, 128, 0.15));
  flex-shrink: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--specific-skeleton-background, rgba(128, 128, 128, 0.15)) 25%,
    var(--specific-skeleton-highlight, rgba(128, 128, 128, 0.25)) 50%,
    var(--specific-skeleton-background, rgba(128, 128, 128, 0.15)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.name {
  width: 100px;
  height: 16px;
}

.time {
  width: 50px;
  height: 12px;
}

.text {
  height: 14px;
}

.textLong {
  width: 80%;
}

.textShort {
  width: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
