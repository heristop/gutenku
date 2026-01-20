<script lang="ts" setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlobalStats } from '@/core/composables/global-stats';
import PreviewCard from '@/core/components/ui/PreviewCard.vue';
import ZenChip from '@/core/components/ui/ZenChip.vue';
import haikuImage320 from '@/assets/img/sumi-e-haiku-320.webp';
import haikuImage640 from '@/assets/img/sumi-e-haiku-640.webp';

const { t } = useI18n();
const { globalStats, fetchGlobalStats, formatNumber } = useGlobalStats();

onMounted(() => {
  fetchGlobalStats();
});
</script>

<template>
  <PreviewCard
    to="/haiku"
    title="GutenVerse"
    :description="t('home.tagline')"
    :cta-text="t('toolbar.generate')"
    :image-src="haikuImage640"
    :image-srcset="`${haikuImage320} 320w, ${haikuImage640} 640w`"
    image-sizes="(max-width: 768px) 100vw, 420px"
    image-alt="Hand-drawn illustration of calligraphy and cherry blossoms for GutenVerse haiku generator"
    :ariaLabel="t('toolbar.generate')"
    view-transition-name="haiku-card"
    illustration-view-transition-name="haiku-illustration"
  >
    <template #subtitle>
      <ZenChip
        v-if="globalStats.weekHaikusGenerated > 0"
        class="preview-card__subtitle"
        variant="muted"
        size="sm"
        :ariaLabel="
          t('home.weekHaikusCrafted', {
            count: formatNumber(globalStats.weekHaikusGenerated),
          })
        "
      >
        {{
          t('home.weekHaikusCrafted', {
            count: formatNumber(globalStats.weekHaikusGenerated),
          })
        }}
      </ZenChip>
    </template>
  </PreviewCard>
</template>

<style lang="scss" scoped>
.preview-card__subtitle {
  margin-top: 0.35rem;
  backdrop-filter: blur(4px);
}
</style>
