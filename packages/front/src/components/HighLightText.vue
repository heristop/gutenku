<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    lines: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
  },
  setup(props) {
    const { error } = storeToRefs(useHaikuStore());

    // Initialize ref for formattedText
    const formattedText = ref('');

    // Use watchEffect to observe changes
    watchEffect(() => {
      let rawText = props.text.trim().replace(/"/g, ' ');

      try {
        props.lines.forEach((line) => {
          rawText = rawText.replace(new RegExp(line.toString(), 'g'), (match) => {
            return `<mark>${match}</mark>`;
          });
        });

        // Update the formattedText without causing a side effect in a computed property
        formattedText.value = rawText.replace(/\n\n/g, '<br /><br />');
      } catch (err) {
        error.value = err as string;
      }
    });

    return {
      formattedText,
    };
  },
});
</script>

<template>
  <span v-html="formattedText" />
</template>
