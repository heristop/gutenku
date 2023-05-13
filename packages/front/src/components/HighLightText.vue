<script lang="ts">
import { computed } from 'vue';
import { useHaikuStore } from '@/store/haiku';
import { storeToRefs } from 'pinia';

const { error } = storeToRefs(useHaikuStore());

export default {
    props: {
        text: {
            type: String,
            required: true,
        },
        lines: {
            type: Array<string>,
            required: true,
        },
    },
    setup(props) {
        const formattedText = computed(() => {
            let rawText = props.text.trim().replace(/"/g, ' ');

            try {
                props.lines.forEach((line) => {
                    rawText = rawText.replace(new RegExp(line.toString(), 'g'), (match) => {
                        return `<mark>${match}</mark>`;
                    });
                });
            } catch (err) {
                error.value = err as string;
            }

            return rawText.replace(/\n\n/g, '<br /><br />');
        });

        return {
            formattedText,
        };
    },
};
</script>

<template>
  <span v-html="formattedText" />
</template>
  
