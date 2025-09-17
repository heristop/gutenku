<script lang="ts" setup>
import { ref, computed, onBeforeMount, onMounted, onUnmounted } from 'vue';
import { useLoadingMessages } from '@/composables/useLoadingMessages';
import { useTheme } from '@/composables/useTheme';

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

const icons = ref<string[]>([]);

const flipIcons = computed(() => {
  return false === props.error && icons.value.length > 0;
});

let iconInterval: NodeJS.Timeout | null = null;

onBeforeMount(() => {
  icons.value.push('mdi-robot-outline');
  icons.value.push('mdi-robot-happy-outline');
  icons.value.push('mdi-robot-excited-outline');
  icons.value.push('mdi-robot-love-outline');
});

onMounted(() => {
  const iconsElements = document.querySelectorAll('.loading i.flip');
  let index = 0;

  if (iconsElements.length > 0) {
    iconsElements[index].classList.add('active');

    iconInterval = setInterval(() => {
      iconsElements[index].classList.remove('active');
      index = (index + 1) % iconsElements.length;
      iconsElements[index].classList.add('active');
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

// Theme integration
const { isDarkMode } = useTheme();
</script>

<template>
  <div class="loading" :class="{ 'loading--dark': isDarkMode }">
    <!-- Theme-aware backdrop -->
    <div class="loading-backdrop"></div>

    <div class="loading-content">
      <div v-if="false === splash" class="robot">
        <v-icon v-show="error" :color="color" :class="['icon', 'active']">
          mdi-robot-dead-outline
        </v-icon>

        <div>
          <v-icon
            v-for="(icon, index) in icons"
            :key="index"
            :class="['flip', 'icon']"
            :color="color"
          >
            {{ icon }}
          </v-icon>
        </div>
      </div>

      <div v-if="displayText" class="loading-splash">
        <!-- Logo with theme-aware background -->
        <div class="logo-container">
          <v-img
            src="@/assets/img/logo/gutenku-logo-300.png"
            alt="Logo"
            height="60"
          />
        </div>

        <v-spacer class="pa-10" />

        <v-sheet
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
        >
          {{ displayText }}
        </v-sheet>

        <v-progress-linear
          :indeterminate="flipIcons"
          color="primary"
          class="mb-0"
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

  // Theme-aware backdrop
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
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--gutenku-shadow-zen);
    border: 1px solid var(--gutenku-border-visible);
    min-width: 300px;
    backdrop-filter: blur(10px);
  }

  .logo-container {
    background: var(--gutenku-paper-bg-warm);
    border-radius: 8px;
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
    font-size: 48px;
    margin: 0 auto;
    animation: slide-in 1s ease-out infinite;
    opacity: 0;
    color: var(--gutenku-text-primary);
  }

  .loading-text {
    font-size: 18px;
    opacity: 0.9;
    border-radius: 6px;
    font-weight: 500;
  }

  // Dark mode specific adjustments
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

// Robot-only mode styling (no splash)
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
