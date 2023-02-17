<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuCard from '@/components/HaikuCard.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

const { fetchText } = useHaikuStore();
const { error } = storeToRefs(useHaikuStore())

const networkError = computed(() => {
    return '' !== error.value;
});

onMounted(fetchText);
</script>

<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="4"
            class="mx-auto h-100 align-center justify-center"
          >
            <v-card
              class="mx-auto pa-4 mb-6"
              :title="$t('titlePresentationBlock')"
            >
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut
                labore
                et dolore magna aliqua.
              </p>

              <v-card-actions class="justify-center">
                <v-btn
                  class="ms-2"
                  icon="mdi-github"
                  href="https://github.com/heristop/gutenku"
                  target="_blank"
                />
                <v-btn
                  class="ms-2"
                  icon="mdi-instagram"
                  variant="text"
                  disabled
                />
              </v-card-actions>
            </v-card>

            <haiku-canvas />
          </v-col>

          <v-col
            cols="12"
            sm="8"
            class="mx-auto h-100 align-center justify-center"
          >
            <haiku-card />

            <haiku-chapter />
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar v-model="networkError">
        <v-icon>mdi-alert</v-icon> {{ error }}
      </v-snackbar>
    </v-responsive>
  </v-container>
</template>

<style lang="scss">
body {
    font-family: Garamond, Georgia, serif;
    font-size: 18px;
}

.v-card-title {
    font-weight: 600;
}

.paragraphes {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
    color: #2c3e50;
    text-align: justify;
    background: rgba(255, 255, 255, 1);
    padding: 0px;

    h3,
    .author {
        &.dark-theme {
            color: transparent;
            text-shadow: 0 0 8px #000;
        }
    }

    p {
        mark {
            padding-inline: 3px;
            background: rgb(248, 174, 62);
        }

        &.dark-theme {
            display: inline;
            background: rgba(0, 0, 0, 0.7);
            padding: 0px;
            border-bottom: 1px solid #bbbbbb;
        }
    }
}
</style>