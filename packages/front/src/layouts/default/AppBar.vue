<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import HaikuOptions from '@/components/HaikuOptions.vue';

const { firstLoaded, optionDrawerOpened } = storeToRefs(useHaikuStore());

const drawer = ref(optionDrawerOpened);
</script>

<template>
  <v-app-bar color="primary">
    <v-spacer :class="firstLoaded ? 'mx-7' : 'mx-0'" />

    <v-img
      class="logo"
      src="@/assets/img/logo/gutenku_white.png"
      alt="GutenKu Logo"
      height="42"
    />

    <v-spacer />

    <v-tooltip
      :text="!drawer ? 'Menu Drawer Open' : 'Menu Drawer Close'"
      :aria-label="!drawer ? 'Menu Drawer Open' : 'Menu Drawer Close'"
      location="left"
    >
      <template #activator="{ props }">
        <v-btn
          v-show="firstLoaded"
          v-bind="props"
          icon
          data-cy="menu-btn"
          @click="drawer = !drawer"
        >
          <v-icon v-if="!drawer"> mdi-menu-open </v-icon>
          <v-icon v-else> mdi-menu-close </v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    location="right"
    permanent
    color="secondary"
    width="350"
    class="config-drawer"
  >
    <haiku-options />
  </v-navigation-drawer>
</template>

<style scoped>
@media (max-width: 600px) {
  .config-drawer {
    opacity: 0.98;
  }
}
</style>
