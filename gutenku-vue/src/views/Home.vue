<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import HaikuAi from '@/components/HaikuAi.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuCard from '@/components/HaikuCard.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import Loading from '@/components/Loading.vue';
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
            <loading v-if="false === firstLoaded" />

            <v-container v-if="firstLoaded">
                <v-row>
                    <v-col cols="12" sm="8" class="mx-auto h-100 align-center justify-center">
                        <haiku-card />

                        <haiku-canvas />

                        <haiku-chapter />
                    </v-col>

                    <v-col cols="12" sm="4" class="mx-auto h-100 align-center justify-center">
                        <v-card class="mx-auto pa-4 mb-6" title="🌸 🗻">
                            <p>
                                <strong>GutenKu</strong> is a Haiku generator based on a selection of books from <br />
                                Project Gutenberg
                            </p>

                            <v-card-actions class="justify-center">
                                <v-tooltip text="Project Gutenberg" location="bottom">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" class="ms-2" icon="mdi-book-open" href="https://gutenberg.org"
                                            target="_blank" />
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Instagram" location="bottom">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" class="ms-2" icon="mdi-instagram" variant="text"
                                            href="https://www.instagram.com/gutenku.poem" target="_blank" />
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="GitHub" location="bottom">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" class="ms-2" icon="mdi-github"
                                            href="https://github.com/heristop/gutenku" target="_blank" />
                                    </template>
                                </v-tooltip>
                            </v-card-actions>
                        </v-card>

                        <haiku-ai />

                        <v-card class="mx-auto">
                            <v-img lazy-src="@/assets/img/duel.jpg" src="@/assets/img/duel.jpg" cover />

                            <v-footer class="justify-right" color="third">
                                <small>{{ new Date().getFullYear() }} — <strong>heristop</strong></small>
                            </v-footer>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>

            <v-snackbar v-model="networkError" :timeout="2000">
                <v-icon>mdi-alert</v-icon> {{ error }}
            </v-snackbar>
        </v-responsive>
    </v-container>
</template>

<style lang="scss">
@import '@/assets/css/fonts.css';

body {
    font-family: 'Typewriter', serif;

    p {
        font-size: 16px;
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
