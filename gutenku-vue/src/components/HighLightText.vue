<template>
    <span v-html="lines" />
</template>

<script lang="ts">
import { computed } from 'vue';

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
        const lines = computed(() => {
            let rawText = props.text.trim().replace(/"/g, ' ');

            props.lines.forEach((line) => {
                rawText = rawText.replace(new RegExp(line.toString(), 'g'), (match) => {
                    return `<mark>${match}</mark>`;
                });
            });

            return rawText.replace(/\n\n/g, '<br /><br />');
        });

        return {
            lines,
        };
    },
};
</script>
