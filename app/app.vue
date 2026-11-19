<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <header class="app__header">
      <NuxtLink to="/" class="app__logo">Kedronotes</NuxtLink>
    </header>
    <main class="app__main">
      <NuxtPage />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app {
  &__header {
    padding: 16px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  &__logo {
    font-weight: 700;
    font-size: 20px;
    text-decoration: none;
    color: var(--color-text);
  }

  &__main {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 16px;
  }
}
</style>
