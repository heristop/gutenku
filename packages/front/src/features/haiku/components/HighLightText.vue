<script lang="ts">
import { defineComponent, ref, watchEffect, computed, type PropType } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useHaikuStore } from '@/features/haiku/store/haiku';

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
    const { t } = useI18n();
    const { error } = storeToRefs(useHaikuStore());

    const formattedText = ref('');

    const highlightCount = computed(() => props.lines.filter((l) => l && l.trim()).length);
    const ariaDescription = computed(() =>
      t('highlightText.ariaDescription', { count: highlightCount.value }),
    );

    watchEffect(() => {
      let rawText = props.text.trim().replaceAll('"', ' ');

      try {
        props.lines.forEach((line) => {
          // Filter out empty strings, whitespace-only strings, and newlines
          if (line && line.trim() && line.trim().length > 0) {
            rawText = rawText.replaceAll(
              new RegExp(line.toString(), 'g'),
              (match) => {
                return `<mark>${match}</mark>`;
              },
            );
          }
        });

        // Replace line breaks with HTML breaks
        formattedText.value = rawText.replaceAll('\n\n', '<br /><br />');
      } catch (err) {
        error.value = err as string;
      }
    });

    return {
      formattedText,
      ariaDescription,
    };
  },
});
</script>

<template>
  <span
    role="text"
    :aria-description="ariaDescription"
    v-html="formattedText"
  />
</template>
