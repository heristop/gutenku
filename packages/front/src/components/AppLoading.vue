<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue';
import { Sparkles, PartyPopper, Zap, Heart, AlertTriangle } from 'lucide-vue-next';
import { useLoadingMessages } from '@/composables/loading-messages';
import { useTheme } from '@/composables/theme';

const props = defineProps({
  splash: {
    type: Boolean,
    required: false,
    default: false,
  },
  text: {
    type: String,
    required: false,
    default: '',
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  error: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const loadingIcons: Component[] = [Sparkles, PartyPopper, Zap, Heart];
const activeIconIndex = ref(0);

const flipIcons = computed(() => {
  return false === props.error && loadingIcons.length > 0;
});

let iconInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  if (loadingIcons.length > 0) {
    iconInterval = setInterval(() => {
      activeIconIndex.value = (activeIconIndex.value + 1) % loadingIcons.length;
    }, 500);
  }
});

onUnmounted(() => {
  if (null !== iconInterval) {
    clearInterval(iconInterval);
  }
});

const { message: randomMessage } = useLoadingMessages({ context: 'default' });
const displayText = computed(() => props.text || randomMessage);
const { isDarkMode } = useTheme();
</script>

<template>
  <div
    class="loading"
    :class="{ 'loading--dark': isDarkMode }"
    role="dialog"
    aria-modal="true"
    aria-busy="true"
    aria-labelledby="loading-text"
  >
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{
        opacity: 1,
        transition: { duration: 400, ease: 'easeOut' },
      }"
      class="loading-backdrop"
      aria-hidden="true"
    />

    <div
      v-motion
      :initial="{ opacity: 0, y: 20, scale: 0.95 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 500, delay: 100, ease: [0.25, 0.8, 0.25, 1] },
      }"
      class="loading-content"
    >
      <div v-if="false === splash" class="robot" aria-hidden="true">
        <AlertTriangle
          v-if="error"
          :size="48"
          class="icon active text-primary"
        />

        <component
          :is="loadingIcons[activeIconIndex]"
          v-else
          :size="48"
          class="icon active text-primary"
        />
      </div>

      <div v-if="displayText" class="loading-splash">
        <div class="logo-container" aria-hidden="true">
          <v-img
            :style="{ viewTransitionName: 'gutenku-logo' }"
            src="@/assets/img/logo/gutenku-logo-300.png"
            alt=""
            height="60"
          />
        </div>

        <v-spacer class="pa-10" />

        <v-sheet
          id="loading-text"
          class="loading-text px-4 py-1"
          :color="error ? 'error' : 'primary'"
          :style="{
            backgroundColor: error
              ? 'var(--v-theme-error)'
              : 'var(--v-theme-primary)',
            color: error
              ? 'var(--v-theme-on-error)'
              : 'var(--v-theme-on-primary)',
          }"
          role="status"
          aria-live="polite"
        >
          {{ displayText }}
        </v-sheet>

        <v-progress-linear
          :indeterminate="flipIcons"
          color="primary"
          class="mb-0 loading-progress"
          aria-label="Loading progress"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gutenku-app-bg);
    transition: var(--gutenku-transition-zen);
  }

  .loading-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .loading-splash {
    background: var(--gutenku-paper-bg);
    border-radius: var(--gutenku-radius-lg);
    padding: 2rem;
    box-shadow: var(--gutenku-shadow-zen);
    border: 1px solid var(--gutenku-border-visible);
    min-width: 18.75rem;  // 300px
    backdrop-filter: blur(10px);
  }

  .logo-container {
    background: var(--gutenku-paper-bg-warm);
    border-radius: var(--gutenku-radius-md);
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--gutenku-border-visible);
    box-shadow: var(--gutenku-shadow-light);
  }

  .icon.active {
    opacity: 0.75;
  }

  .icon {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 3rem;  // 48px
    margin: 0 auto;
    animation: slide-in 1s ease-out infinite;
    opacity: 0;
    color: var(--gutenku-text-primary);
  }

  .loading-text {
    font-size: 1.125rem;  // 18px
    opacity: 0.9;
    font-weight: 500;
    border-top-left-radius: var(--gutenku-radius-md);
    border-top-right-radius: var(--gutenku-radius-md);
  }

  .loading-progress {
    border-bottom-left-radius: var(--gutenku-radius-lg);
    border-bottom-right-radius: var(--gutenku-radius-lg);
    overflow: hidden;

    :deep(.v-progress-linear__determinate) {
      border-bottom-left-radius: var(--gutenku-radius-lg);
      border-bottom-right-radius: var(--gutenku-radius-lg);
    }

    :deep(.v-progress-linear__indeterminate) {
      border-bottom-left-radius: var(--gutenku-radius-lg);
      border-bottom-right-radius: var(--gutenku-radius-lg);
    }

    :deep(.v-progress-linear__background) {
      border-bottom-left-radius: var(--gutenku-radius-lg);
      border-bottom-right-radius: var(--gutenku-radius-lg);
    }
  }

  &.loading--dark {
    .loading-backdrop {
      background: var(--gutenku-app-bg);
    }

    .logo-container {
      background: var(--gutenku-paper-bg-warm);
      box-shadow: var(--gutenku-shadow-medium);
    }

    .loading-splash {
      background: var(--gutenku-paper-bg);
      box-shadow: var(--gutenku-shadow-zen);
    }
  }
}

.loading:not(.loading-splash) {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);

  .loading-backdrop {
    display: none;
  }
}

@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-20px);
  }
  50% {
    opacity: 0.75;
    transform: translate(-50%, -50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(20px);
  }
}
</style>
