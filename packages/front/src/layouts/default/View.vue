<script lang="ts" setup />

<template>
  <v-main id="main-content" class="gutenku-app-background" tabindex="-1">
    <router-view />
  </v-main>
</template>

<style lang="scss" scoped>
.gutenku-app-background {
  background: var(--gutenku-app-bg);
  transition: var(--gutenku-transition-zen);
  min-height: 100vh;
}
</style>
