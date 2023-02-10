<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import BookService from '../services/BookService';
import HighlightText from './HighLightText.vue';
import { HaikuValue } from '../types';

const blackMarker = ref<Boolean>(false);
const loading = ref<Boolean>(false);

let networkError = ref<Boolean>(false);
let displaySnackbar = ref<Boolean>(false);
let haiku = ref<HaikuValue>();

async function fetchText() {
    haiku.value = {
        'book': {
            'title': '',
            'author': '',
        },
        'chapter': {
            'title': '',
            'content': ''
        },
        'verses': [],
        'raw_verses': []
    };

    loading.value = true;
    networkError.value = false;

    try {
        haiku.value = await BookService.fetch();
    } catch (error) {
        networkError.value = true;
        displaySnackbar.value = true;
    } finally {
        loading.value = false;
    }
}

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}

onMounted(fetchText);
</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="12" sm="8" class="h-100">
                <v-card v-if="haiku" :loading="loading" class="paragraphes pa-10 align-center justify-center"
                    min-height="600px">
                    <iframe v-show="networkError" src='https://gfycat.com/ifr/FirmObeseDuckbillcat' frameborder='0'
                        scrolling='no' width='640' height='396'></iframe>

                    <h3 class="text-h5 text-center mb-4">
                        {{ haiku.book.title }}
                    </h3>

                    <div class="text-center mb-6">
                        {{ haiku.book.author }}
                    </div>

                    <v-row class="d-flex align-center justify-center">
                        <v-col cols="auto">
                            <p :class="{
                                'dark-theme': blackMarker,
                                'light-theme': !blackMarker
                            }">
                                <highlight-text :text="haiku.chapter.content" :lines="haiku.raw_verses" />
                            </p>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4">
                <v-card :loading="loading" class="actions pa-10 align-center justify-center mb-6">
                    <v-row class="d-flex align-center justify-center ma-6 pa-10">
                        <div class="w-100">
                            <v-col align="center">
                                <v-btn size="small" color="primary" :disabled="loading"
                                    :prepend-icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
                                    @click="fetchText()">
                                    Fetch
                                </v-btn>
                            </v-col>

                            <v-col align="center">
                                <v-btn size="small" color="primary" :disabled="loading"
                                    :prepend-icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
                                    @click="toggle()">
                                    Toggle
                                </v-btn>
                            </v-col>
                        </div>
                    </v-row>
                </v-card>

                <v-card v-if="haiku && haiku.verses.length > 0" :loading="loading"
                    class="pa-10 justify-center align-center" min-height="150px">
                    <v-row>
                        <div class="w-100">
                            <h3><v-icon>mdi-notification-clear-all</v-icon> Haiku generated</h3>

                            <v-divider />

                            <div class="justify-left align-left pa-4">
                                <p class="paragraphes pa-2" v-for="sentence in haiku.verses" :key="sentence">{{
                                    sentence
                                }}<br /></p>
                            </div>
                        </div>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <v-snackbar v-model="displaySnackbar" multi-line>
        Network Error

        <template v-slot:actions>
            <v-btn color="red" variant="text" @click="displaySnackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<style lang="scss">
.actions {
    .v-btn {
        width: 120px;
    }
}

.paragraphes {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 16px;
    line-height: 1.6;
    color: #2c3e50;
    text-align: justify;
    font-family: Times, "Times New Roman", Georgia, serif;
    background: rgba(255, 255, 255, 1);
    padding: 0px;

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

            mark {
                background: rgba(255, 255, 255, 1);
            }
        }
    }
}
</style>
