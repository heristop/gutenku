<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import BookService from '../services/BookService';
import HighlightText from './HighLightText.vue';
import { HaikuValue } from '../types';

const blackMarker = ref(true);
const loading = ref(false);

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

    try {
        haiku.value = await BookService.fetch();
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
            <v-col cols="12" sm="8">
                <v-card v-if="haiku" :loading="loading" class="paragraphes pa-10 align-center justify-center">
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
                <v-card :loading="loading" class="pa-10 align-center justify-center mb-6">
                    <v-row class="d-flex align-center justify-center ma-6">
                        <v-col align="center">
                            <v-btn size="small" color="primary" prepend-icon="mdi-reload" @click="fetchText()">
                                Fetch
                            </v-btn>
                        </v-col>

                        <v-col align="center">
                            <v-btn size="small" color="primary" prepend-icon="mdi-flip-horizontal" @click="toggle()">
                                Toggle
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card>

                <v-card v-if="haiku" :loading="loading" class="pa-10 justify-center align-center">
                    <v-row>
                        <div>
                            <b>Haiku generated</b>

                            <v-divider />

                            <div class="justify-left align-left pa-2">
                                <p class="paragraphes" v-for="sentence in haiku.verses" :key="sentence">{{
                                    sentence
                                }}<br /></p>
                            </div>
                        </div>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss">
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
