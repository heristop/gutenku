<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import AppFooter from '@/components/AppFooter.vue';
import HaikuAi from '@/components/HaikuAi.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuCard from '@/components/HaikuCard.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import SocialNetwok from '@/components/SocialNetwork.vue';
import AppLoading from '@/components/AppLoading.vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { fetchText } = useHaikuStore();
const { error, firstLoaded } = storeToRefs(useHaikuStore())

const networkError = computed(() => {
    return '' !== error.value;
});

onMounted(fetchText);
</script>

<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-sheet v-if="false === firstLoaded">
        <app-loading text="Generating Haiku..." />
      </v-sheet>

      <v-container v-if="firstLoaded">
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
          </v-col>

          <v-col
            cols="12"
            sm="4"
            class="mx-auto h-100 align-center justify-center order-2"
          >
            <social-netwok class="d-none d-sm-block" />

            <haiku-ai />

            <haiku-canvas />

            <haiku-chapter class="d-sm-none" />

            <app-footer />
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar
        v-model="networkError"
        :timeout="2000"
        color="primary"
      >
        <v-icon>mdi-robot-dead-outline</v-icon> I cannot connect to the server :( Come back later...
      </v-snackbar>
    </v-responsive>
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
}

.paragraphes {
    color: #2c3e50;
    text-align: justify;
    background: rgba(255, 255, 255, 1);
    padding: 0px;

    h3,
    .author {
        &.dark-theme {
            color: transparent;
            text-shadow: 0 0 10px #000;
        }
    }

    p {
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
</style>
