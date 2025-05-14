<template>
  <section :class="$style.container">
    <h3>スタンプパレット</h3>
    <div :class="$style.text">
      <p>traQのスタンプをまとめたパレットを作成できます。</p>
      <p>スタンプパレットのアイコンはパレット先頭のスタンプが使用されます。</p>
    </div>
  </section>
</template>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.text {
  margin-left: 12px;
}
</style>
