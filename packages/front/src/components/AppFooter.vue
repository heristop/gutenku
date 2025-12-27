<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type ZenCreditsModal from '@/components/ui/ZenCreditsModal.vue';

const { t } = useI18n();
const currentYear = new Date().getFullYear();
const creditsModal = ref<InstanceType<typeof ZenCreditsModal> | null>(null);

function openCredits() {
  creditsModal.value?.open();
}
</script>

<template>
  <div class="app-footer">
    <v-card class="gutenku-card footer-card mx-auto order-4 mb-6">
      <v-btn
        color="primary"
        size="small"
        variant="text"
        :aria-label="t('footer.openCredits')"
        class="footer-button"
        @click="openCredits"
      >
        {{ t('footer.copyright', { year: currentYear }) }}
      </v-btn>
    </v-card>

    <ZenCreditsModal ref="creditsModal" />
  </div>
</template>

<style scoped lang="scss">
// Footer card styling
.footer-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem !important;
}

.footer-button {
  font-family: 'JMH Typewriter', monospace !important;
  letter-spacing: 0.5px;
  color: rgb(var(--v-theme-primary)) !important;

  &:hover {
    color: var(--gutenku-text-primary) !important;
    background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 10%, transparent) !important;
  }
}

[data-theme='dark'] .footer-card {
  .footer-button {
    color: var(--gutenku-text-primary) !important;

    :deep(.v-btn__content) {
      color: var(--gutenku-text-primary) !important;
    }

    &:hover {
      color: var(--gutenku-zen-accent) !important;
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 15%, transparent) !important;

      :deep(.v-btn__content) {
        color: var(--gutenku-zen-accent) !important;
      }
    }

    &:active {
      color: var(--gutenku-text-primary) !important;

      :deep(.v-btn__content) {
        color: var(--gutenku-text-primary) !important;
      }
    }

    &:focus-visible {
      color: var(--gutenku-text-primary) !important;
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: 2px;

      :deep(.v-btn__content) {
        color: var(--gutenku-text-primary) !important;
      }
    }
  }

  * {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      color: var(--gutenku-text-primary) !important;
    }
  }

  span,
  div,
  p,
  a {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      color: var(--gutenku-text-primary) !important;
    }
  }
}

@media (max-width: 768px) {
  .footer-card {
    padding: 1rem !important;
    margin-bottom: 1.5rem !important;
  }

  .footer-button {
    font-size: 0.85rem;
    min-height: 44px;
  }
}
</style>
