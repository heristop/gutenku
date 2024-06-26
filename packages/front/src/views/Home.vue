<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import AppFooter from '@/components/AppFooter.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuCard from '@/components/HaikuCard.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import SocialNetwok from '@/components/SocialNetwork.vue';
import AppLoading from '@/components/AppLoading.vue';

const { fetchNewHaiku } = useHaikuStore();
const { error, firstLoaded, networkError, notificationError, optionUseCache } =
  storeToRefs(useHaikuStore());

const loadingLabel = computed(() => {
  if (true === optionUseCache.value) {
    return 'Extracting Haiku...';
  }

  return 'Generating Haiku...';
});

onMounted(fetchNewHaiku);
</script>

<template>
  <v-container
    class="d-flex justify-center align-center"
    v-if="false === firstLoaded || networkError"
  >
    <v-btn
      variant="plain"
      color="accent"
      size="x-large"
      href="https://gutenku.xyz"
    >
      gutenku.xyz
    </v-btn>

    <v-tooltip
      v-if="networkError"
      text="Refresh"
      aria-label="Refresh"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          color="primary"
          density="compact"
          icon="mdi-refresh"
          alt="Refresh"
          @click="$router.go(0)"
        />
      </template>
    </v-tooltip>
  </v-container>

  <v-container class="fill-height">
    <div class="d-flex text-center fill-height">
      <v-sheet v-if="false === firstLoaded">
        <app-loading :text="loadingLabel" :splash="true" />
      </v-sheet>

      <v-sheet v-show="networkError">
        <app-loading
          :splash="true"
          error
          text="Cannot connect to the server :("
        />
      </v-sheet>

      <v-container v-if="firstLoaded && false === networkError">
        <v-row class="d-flex">
          <v-col
            cols="12"
            sm="12"
            class="d-sm-none mx-auto h-100 align-center justify-center order-0"
          >
            <social-netwok />
          </v-col>

          <v-col
            cols="12"
            sm="8"
            class="mx-auto h-100 align-center justify-center order-1"
          >
            <haiku-card />

            <haiku-chapter class="d-none d-sm-flex" />

            <v-img
              height="200"
              src="@/assets/img/bird.webp"
              alt="Bird Image"
              class="text-primary"
            />
          </v-col>

          <v-col
            cols="12"
            sm="4"
            class="mx-auto h-100 align-center justify-center order-2"
          >
            <social-netwok class="d-none d-sm-block" />

            <haiku-canvas />

            <haiku-chapter class="d-sm-none" />

            <app-footer />
          </v-col>
        </v-row>

        <v-snackbar v-model="notificationError" :timeout="4000" color="primary">
          {{ error }}

          <template #actions>
            <v-btn
              @click="error = ''"
              alt="Close"
              icon="mdi-close"
              size="small"
            />
          </template>
        </v-snackbar>
      </v-container>
    </div>
  </v-container>
</template>

<style lang="scss">
@import '@/assets/css/main.scss';
</style>
