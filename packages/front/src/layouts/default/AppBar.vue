<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import HaikuOptions from '@/components/HaikuOptions.vue';

const { firstLoaded } = storeToRefs(useHaikuStore());

const drawer = ref(false);
</script>

<template>
  <v-app-bar color="primary">
    <v-spacer :class="firstLoaded ? 'mx-7' : 'mx-0'" />

    <v-img class="logo" src="@/assets/img/logo/gutenku_white.png" alt="GutenKu" height="42" />

    <v-spacer />

    <v-btn v-show="firstLoaded" icon @click="drawer = !drawer">
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- Navigation Drawer qui s'ouvre depuis la droite -->
  <v-navigation-drawer v-model="drawer" location="right" permanent color="secondary" width="350" class="config-drawer">
    <haiku-options />
  </v-navigation-drawer>
</template>

<style scoped>
@media (max-width: 600px) {
  .config-drawer {
    opacity: 0.9;
  }
}
</style>
