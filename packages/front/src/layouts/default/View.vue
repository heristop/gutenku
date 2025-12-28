<script lang="ts" setup />

<template>
  <v-main id="main-content" class="gutenku-app-background" tabindex="-1">
    <router-view />
  </v-main>
</template>

<style lang="scss" scoped>
.gutenku-app-background {
  background-color: var(--gutenku-app-bg);
  background-image: var(--gutenku-app-bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  transition: var(--gutenku-transition-zen);
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
