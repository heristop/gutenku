<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import AppFooter from '@/components/AppFooter.vue';
import HaikuOptions from '@/components/HaikuOptions.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuCard from '@/components/HaikuCard.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import SocialNetwok from '@/components/SocialNetwork.vue';
import AppLoading from '@/components/AppLoading.vue';

const { fetchNewHaiku } = useHaikuStore();
const {
    error,
    firstLoaded,
    networkError,
    notificationError,
    optionUseCache
} = storeToRefs(useHaikuStore());

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
      color="third"
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
        <app-loading
          :text="loadingLabel"
          :splash="true"
        />
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
              class="text-primary"
            />
          </v-col>

          <v-col
            cols="12"
            sm="4"
            class="mx-auto h-100 align-center justify-center order-2"
          >
            <social-netwok class="d-none d-sm-block" />

            <haiku-options />

            <haiku-canvas />

            <haiku-chapter class="d-sm-none" />

            <app-footer />
          </v-col>
        </v-row>

        <v-snackbar
          v-model="notificationError"
          :timeout="4000"
          color="primary"
        >
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
@import '@/assets/css/fonts.css';

body {
  font-family: 'Typewriter', serif;

  p {
    font-size: 1em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
  }

  .text-h5 {
    font-family: 'Typewriter', serif !important;
  }
}

.v-btn {
  text-transform: none;
}

.book {
  color: #2c3e50;
  text-align: justify;
  background: rgba(255, 255, 255, 1);
  padding: 0px;

  h1,
  .author {
    &.dark-theme {
      color: transparent;
      text-shadow: 0 0 10px #000;
    }
  }

  .chapter {
    p {
      content-visibility: auto;

      mark {
        padding-inline: 3px;
        background: rgb(248, 174, 62);
      }

      &.dark-theme {
        display: inline;
        background: #2F5D62;
        padding: 0px;
        border-bottom: 1px solid #bbbbbb;
      }
    }
  }
}
</style>
