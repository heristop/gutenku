<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { load } from '@fingerprintjs/botd'
import HighLightText from '@/components/HighLightText.vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}

onMounted(() => {
    const botdPromise = load();

    botdPromise.then((botd) => {
        if (true === botd.detect().bot) {
            blackMarker.value = false;
        }
    });
})
</script>

<template>
    <v-card v-if="haiku" :loading="loading" color="secondary" class="pa-4 mb-6 align-center justify-center">
        Disclose chapter where quotes were extracted
        <v-row>
            <v-col>
                <v-tooltip :disabled="loading" text="Disclose / Hide" location="bottom" aria-label="Disclose / Hide">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" :icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
                            @click="toggle()" color="primary" alt="Disclose / Hide" aria-label="Disclose / Hide"
                            title="Disclose / Hide" data-cy="light-toggle-btn" size="small" />
                    </template>
                </v-tooltip>
            </v-col>
        </v-row>

        <v-row class="paragraphes" @click="toggle()">
            <v-col>
                <h3 :class="{
                    'dark-theme': blackMarker,
                    'light-theme': !blackMarker
                }" class="ma-4 text-h5 text-center mb-4">
                    {{ haiku.book.title }}
                </h3>

                <div :class="{
                    'dark-theme': blackMarker,
                    'light-theme': !blackMarker
                }" class="text-center mb-6 author">
                    {{ haiku.book.author }}
                </div>

                <v-row class="d-flex align-center justify-center">
                    <v-col cols="auto">
                        <v-sheet class="overflow-y-auto" max-height="400">
                            <v-card-text>
                                <p :class="{
                                    'dark-theme': blackMarker,
                                    'light-theme': !blackMarker
                                }">
                                    <high-light-text :text="haiku.chapter.content" :lines="haiku.rawVerses" />
                                </p>
                            </v-card-text>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-card>
</template>
