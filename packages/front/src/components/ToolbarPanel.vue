<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

// Store setup
const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading, firstLoaded } = storeToRefs(haikuStore);

// Copy status with error handling
const copyStatus = ref<{ copied: boolean; error: string | null }>({
  copied: false,
  error: null,
});

// Dynamic button label based on auto-cache mode
const buttonLabel = computed<string>(() => {
  if (loading.value) {
    return firstLoaded.value ? 'Generating' : 'Extracting';
  }
  return firstLoaded.value ? 'Generate' : 'Extract';
});

// Haiku generation
async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

// Copy haiku to clipboard
async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) return;

  try {
    await navigator.clipboard.writeText(haiku.value.verses.join('\n'));
    copyStatus.value = { copied: true, error: null };
    setTimeout(() => {
      copyStatus.value.copied = false;
    }, 2000);
  } catch (err) {
    copyStatus.value = {
      copied: false,
      error: err instanceof Error ? err.message : 'Failed to copy',
    };
  }
}
</script>

<template>
  <div class="gutenku-card mt-2 mt-sm-0 mb-6">
    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- Extract/Generate Button -->
      <v-tooltip :text="`${buttonLabel} a new haiku`" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="extractGenerate"
            :loading="loading"
            :disabled="loading"
            class="zen-btn gutenku-btn gutenku-btn-generate"
            data-cy="fetch-btn"
            variant="outlined"
            size="small"
          >
            <v-icon>{{
              loading ? 'mdi-loading mdi-spin' : 'mdi-creation'
            }}</v-icon>
            <span class="btn-text">{{ buttonLabel }}</span>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Copy Button -->
      <v-tooltip text="Copy haiku to clipboard" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="copyHaiku"
            :class="{ success: copyStatus.copied }"
            class="zen-btn gutenku-btn gutenku-btn-copy"
            data-cy="copy-btn"
            variant="outlined"
            size="small"
            :disabled="!haiku?.verses?.length"
          >
            <v-icon>{{
              copyStatus.copied ? 'mdi-check' : 'mdi-content-copy'
            }}</v-icon>
            <span class="btn-text">{{
              copyStatus.copied ? 'Copied!' : 'Copy'
            }}</span>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- Copy Success Snackbar -->
    <v-snackbar
      v-model="copyStatus.copied"
      color="primary"
      location="top"
      class="elevation-24 copy-snack"
      timeout="2000"
    >
      <template #default>
        <div class="d-flex align-center">
          <v-icon class="mr-2" data-cy="copy-success-icon">
            mdi-check-circle
          </v-icon>
          <span>Haiku copied to clipboard!</span>
        </div>
      </template>

      <template #actions="{ isActive }">
        <v-btn
          :active="isActive.value"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="copyStatus.copied = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<style lang="scss" scoped>
// Action buttons layout
.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

// Component-specific overrides only
.zen-btn {
  &.v-btn--variant-outlined {
    border-width: 1.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // Dark mode visibility
  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.12) !important;
    color: rgba(255, 255, 255, 0.95) !important;
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);

    .v-icon {
      color: rgba(255, 255, 255, 0.95) !important;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
    }

    .btn-text {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    // Dark mode hover
    [data-theme='dark'] & {
      background: rgba(255, 255, 255, 0.18) !important;
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);

      .v-icon {
        color: rgba(255, 255, 255, 1) !important;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
      }

      .btn-text {
        color: rgba(255, 255, 255, 1) !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }
    }
  }

  // Success state for copy button
  &.success {
    [data-theme='dark'] & {
      background: rgba(76, 175, 80, 0.2) !important;
      border-color: rgba(76, 175, 80, 0.6);
      color: rgba(255, 255, 255, 1) !important;

      .v-icon,
      .btn-text {
        color: rgba(255, 255, 255, 1) !important;
      }
    }
  }
}
</style>
