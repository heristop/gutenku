<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    duration?: number;
    loop?: boolean;
  }>(),
  {
    duration: 30,
    loop: false,
  },
);

const svgRef = ref<SVGSVGElement | null>(null);
const isPaused = ref(false);
let pauseTimeout: ReturnType<typeof setTimeout> | null = null;
let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

function handleAnimationStart(e: AnimationEvent) {
  // Use includes() because Vue scoped CSS hashes animation names
  if (e.animationName.includes('cat-walk-across')) {
    const durationMs = props.duration * 1000;
    const pauseStart = durationMs * 0.35;
    const pauseEnd = durationMs * 0.47;

    pauseTimeout = setTimeout(() => {
      isPaused.value = true;
    }, pauseStart);

    resumeTimeout = setTimeout(() => {
      isPaused.value = false;
    }, pauseEnd);
  }
}

onMounted(() => {
  svgRef.value?.addEventListener('animationstart', handleAnimationStart);
});

onUnmounted(() => {
  svgRef.value?.removeEventListener('animationstart', handleAnimationStart);
  if (pauseTimeout) {clearTimeout(pauseTimeout);}
  if (resumeTimeout) {clearTimeout(resumeTimeout);}
});
</script>

<template>
  <div
    class="sumi-cat-container"
    :class="{ 'sumi-cat-container--once': !loop }"
    aria-hidden="true"
  >
    <svg
      ref="svgRef"
      class="sumi-cat"
      :class="{ 'sumi-cat--paused': isPaused }"
      :style="{ '--cat-duration': `${props.duration}s` }"
      viewBox="0 0 110 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Ink texture for organic brush feel -->
        <filter id="sumi-texture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="4"
            seed="15"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <!-- Ground shadow - soft ellipse beneath cat -->
      <ellipse
        class="sumi-cat__shadow"
        cx="55"
        cy="47"
        rx="28"
        ry="3"
        fill="currentColor"
        stroke="none"
        opacity="0.08"
      />

      <!-- Sumi-e ink brush cat -->
      <g
        class="sumi-cat__group"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#sumi-texture)"
      >
        <!-- === FAR LEGS (behind body, lighter) === -->
        <!-- Back far leg with paw curl -->
        <path
          class="sumi-cat__leg sumi-cat__leg--back-far"
          d="M24 30 C23 34, 22 37, 21 40 C20 43, 21 44.5, 23 44.5 L24 43.5"
          stroke-width="2.5"
          opacity="0.35"
        />
        <!-- Front far leg with paw curl -->
        <path
          class="sumi-cat__leg sumi-cat__leg--front-far"
          d="M68 28 C69 32, 70 36, 71 40 C72 43, 71 44.5, 69 44.5 L68 43.5"
          stroke-width="2.5"
          opacity="0.35"
        />

        <!-- === BODY - Main ink brush stroke === -->
        <!-- Back line - single confident brush stroke -->
        <path
          class="sumi-cat__body sumi-cat__body--back"
          d="M20 32 C28 24, 45 22, 58 23 C71 24, 82 27, 88 31"
          stroke-width="3"
        />
        <!-- Secondary stroke for brush thickness variation -->
        <path
          class="sumi-cat__body-accent"
          d="M35 24 C50 22, 65 23, 78 27"
          stroke-width="1.5"
          opacity="0.3"
        />

        <!-- Belly - lighter wash stroke -->
        <path
          class="sumi-cat__belly"
          d="M28 36 C40 39, 55 38, 72 34"
          stroke-width="2"
          opacity="0.4"
        />

        <!-- === TAIL - Flowing brush stroke === -->
        <!-- Main tail stroke - confident curve -->
        <path
          class="sumi-cat__tail"
          d="M20 32 C12 31, 8 26, 6 20 C4 14, 6 9, 11 7"
          stroke-width="3.5"
        />
        <!-- Tail taper - getting thinner -->
        <path
          class="sumi-cat__tail-tip"
          d="M6 20 C4 14, 6 9, 11 7 C14 5, 16 7, 15 10"
          stroke-width="1.5"
          opacity="0.7"
        />

        <!-- === NEAR LEGS (in front, darker) === -->
        <!-- Back near leg with paw curl -->
        <path
          class="sumi-cat__leg sumi-cat__leg--back-near"
          d="M30 34 C29 37, 28 40, 27 43 C26 45.5, 28 46.5, 30 45.5 L31 44.5"
          stroke-width="2.8"
        />
        <!-- Paw pad hint for back near leg -->
        <circle
          class="sumi-cat__paw sumi-cat__paw--back-near"
          cx="29"
          cy="45.5"
          r="1.2"
          fill="currentColor"
          stroke="none"
          opacity="0.25"
        />
        <!-- Front near leg with paw curl -->
        <path
          class="sumi-cat__leg sumi-cat__leg--front-near"
          d="M75 31 C76 35, 77 39, 78 43 C79 45.5, 77 46.5, 75 45.5 L74 44.5"
          stroke-width="2.8"
        />
        <!-- Paw pad hint for front near leg -->
        <circle
          class="sumi-cat__paw sumi-cat__paw--front-near"
          cx="76"
          cy="45.5"
          r="1.2"
          fill="currentColor"
          stroke="none"
          opacity="0.25"
        />

        <!-- === HEAD GROUP (for head bob animation) === -->
        <g class="sumi-cat__head-group">
          <!-- Main head shape - brush oval -->
          <ellipse
            class="sumi-cat__head"
            cx="92"
            cy="24"
            rx="11"
            ry="9"
            stroke-width="2.8"
          />
          <!-- Head accent stroke -->
          <path
            class="sumi-cat__head-accent"
            d="M83 20 C86 17, 95 17, 100 22"
            stroke-width="1.2"
            opacity="0.25"
          />

          <!-- === EARS - Quick brush flicks === -->
          <!-- Left ear -->
          <path
            class="sumi-cat__ear sumi-cat__ear--left"
            d="M82 18 C83 12, 85 9, 86 8 C87 10, 88 14, 88 17"
            stroke-width="2.2"
          />
          <!-- Right ear -->
          <path
            class="sumi-cat__ear sumi-cat__ear--right"
            d="M91 15 C93 9, 96 6, 97 5 C98 7, 99 12, 98 15"
            stroke-width="2.2"
          />
          <!-- Inner ear marks - single quick strokes -->
          <path
            d="M84 14 L85 11"
            stroke-width="1"
            opacity="0.3"
          />
          <path
            d="M94 11 L95 8"
            stroke-width="1"
            opacity="0.3"
          />

          <!-- === FACE DETAILS === -->
          <!-- Eye - simple ink dot with slight shape -->
          <ellipse
            class="sumi-cat__eye"
            cx="96"
            cy="22"
            rx="1.8"
            ry="1.4"
            fill="currentColor"
            stroke="none"
          />

          <!-- Nose - small triangle brush stroke -->
          <path
            class="sumi-cat__nose"
            d="M101 26 L103 28 L100 28 Z"
            fill="currentColor"
            stroke="none"
            opacity="0.6"
          />

          <!-- Muzzle whisker base -->
          <path
            d="M99 28 C100 29, 99 30, 98 30"
            stroke-width="0.8"
            opacity="0.3"
          />

          <!-- === WHISKERS - Delicate ink lines === -->
          <g class="sumi-cat__whiskers" stroke-width="0.6" opacity="0.45">
            <path d="M101 26 C105 24, 109 23, 112 22" />
            <path d="M102 27 C106 27, 110 27, 114 27" />
            <path d="M101 29 C105 30, 109 32, 112 34" />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.sumi-cat-container {
  --cat-duration: 30s;

  position: absolute;
  top: -38px;
  left: 0;
  right: 0;
  height: 48px;
  overflow: visible;
  pointer-events: none;
  z-index: 100;

  &--once .sumi-cat {
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }
}

.sumi-cat {
  --sumi-ink: var(--gutenku-zen-primary);

  position: absolute;
  bottom: 0;
  left: 10%;
  width: 62px;
  height: 44px;
  color: var(--sumi-ink);
  opacity: 0;
  will-change: left, opacity;

  // Subtle shadow like ink on paper
  filter: drop-shadow(0 0.5px 0.5px oklch(0 0 0 / 0.06));

  animation: cat-walk-across var(--cat-duration) ease-in-out;

  // Ground shadow - pulses with walking rhythm
  &__shadow {
    animation: shadow-pulse 1.2s ease-in-out infinite;
  }

  &__group {
    opacity: 0.82;
    animation: body-bob 0.6s ease-in-out infinite;
  }

  // Head group - subtle bob while walking, look around during pause
  &__head-group {
    transform-origin: 88px 28px; // neck position
    animation:
      head-bob 1.2s ease-in-out infinite,
      head-look var(--cat-duration) ease-in-out;
  }

  // Spine breathing motion
  &__body--back {
    animation: spine-flex 1.2s ease-in-out infinite;
    transform-origin: 55px 27px;
  }

  // === WALKING GAIT ===
  // Diagonal pairs move together (realistic cat walk)

  &__leg--front-near {
    transform-origin: 75px 31px;
    animation: leg-front 1.2s ease-in-out infinite;
  }

  &__leg--back-far {
    transform-origin: 24px 30px;
    animation: leg-back 1.2s ease-in-out infinite;
  }

  &__leg--front-far {
    transform-origin: 68px 28px;
    animation: leg-front 1.2s ease-in-out infinite;
    animation-delay: 0.6s;
  }

  &__leg--back-near {
    transform-origin: 30px 34px;
    animation: leg-back 1.2s ease-in-out infinite;
    animation-delay: 0.6s;
  }

  // Paw pads - animate with legs
  &__paw--front-near {
    transform-origin: 75px 31px;
    animation: paw-front 1.2s ease-in-out infinite;
  }

  &__paw--back-near {
    transform-origin: 30px 34px;
    animation: paw-back 1.2s ease-in-out infinite;
    animation-delay: 0.6s;
  }

  // Tail flowing movement
  &__tail {
    transform-origin: 20px 32px;
    animation: tail-sway 2s ease-in-out infinite;
  }

  &__tail-tip {
    transform-origin: 20px 32px;
    animation: tail-sway 2s ease-in-out infinite;
    animation-delay: 0.1s;
  }

  // Ear twitches
  &__ear--left {
    transform-origin: 85px 15px;
    animation: ear-twitch 4.5s ease-in-out infinite;
  }

  &__ear--right {
    transform-origin: 96px 12px;
    animation: ear-twitch 4.5s ease-in-out infinite;
    animation-delay: 2.2s;
  }

  // Whisker subtle movement
  &__whiskers {
    transform-origin: 101px 27px;
    animation: whisker-twitch 3.5s ease-in-out infinite;
  }

  // Eye blink
  &__eye {
    transform-origin: 96px 22px;
    animation: eye-blink 5.5s ease-in-out infinite;
  }

  // Pause walking animations when cat stops
  // Use :deep() to ensure selectors work with scoped CSS
  &--paused {
    :deep(.sumi-cat__group) {
      animation-play-state: paused;
    }

    :deep(.sumi-cat__leg) {
      animation-play-state: paused;
    }

    :deep(.sumi-cat__paw) {
      animation-play-state: paused;
    }

    :deep(.sumi-cat__body--back) {
      animation-play-state: paused;
    }

    :deep(.sumi-cat__tail),
    :deep(.sumi-cat__tail-tip) {
      animation-play-state: paused;
    }

    :deep(.sumi-cat__shadow) {
      animation-play-state: paused;
    }

    // Keep these running during pause for life-like feel:
    // - head-look (looking around)
    // - ear-twitch
    // - whisker-twitch
    // - eye-blink
  }
}

// === KEYFRAMES ===

// Main walk with pause behavior at ~40% through
@keyframes cat-walk-across {
  0% {
    left: 10%;
    opacity: 0;
  }
  6% {
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  // Walk to pause position
  35% {
    left: 40%;
    opacity: 1;
  }
  // Pause and look around (35-48%)
  36%,
  47% {
    left: 40%;
  }
  // Continue walking
  82% {
    opacity: 1;
  }
  92% {
    opacity: 0;
  }
  100% {
    left: calc(90% - 62px);
    opacity: 0;
  }
}

// Shadow pulses with walking rhythm
@keyframes shadow-pulse {
  0%,
  100% {
    transform: scaleX(1);
    opacity: 0.08;
  }
  50% {
    transform: scaleX(0.94);
    opacity: 0.05;
  }
}

// Subtle head bob while walking
@keyframes head-bob {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(-1.2deg) translateY(-0.3px);
  }
  75% {
    transform: rotate(0.8deg) translateY(0.2px);
  }
}

// Head looks around during pause
@keyframes head-look {
  0%,
  35%,
  48%,
  100% {
    transform: rotate(0deg);
  }
  38% {
    transform: rotate(-8deg); // look left
  }
  42% {
    transform: rotate(6deg); // look right
  }
  45% {
    transform: rotate(-3deg); // back center
  }
}

@keyframes body-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.7px);
  }
}

@keyframes spine-flex {
  0%,
  100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(1.006);
  }
}

// Higher leg lift for more visible paw action
@keyframes leg-front {
  0%,
  100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(26deg) translateY(-1px);
  }
  50% {
    transform: rotate(0deg);
  }
  65% {
    transform: rotate(-18deg);
  }
}

@keyframes leg-back {
  0%,
  100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(-26deg) translateY(-1px);
  }
  50% {
    transform: rotate(0deg);
  }
  65% {
    transform: rotate(18deg);
  }
}

// Paw pad animations - follow leg movement
@keyframes paw-front {
  0%,
  100% {
    transform: rotate(0deg);
    opacity: 0.25;
  }
  15% {
    transform: rotate(26deg) translateY(-1px);
    opacity: 0.35;
  }
  50% {
    transform: rotate(0deg);
    opacity: 0.25;
  }
  65% {
    transform: rotate(-18deg);
    opacity: 0.2;
  }
}

@keyframes paw-back {
  0%,
  100% {
    transform: rotate(0deg);
    opacity: 0.25;
  }
  15% {
    transform: rotate(-26deg) translateY(-1px);
    opacity: 0.35;
  }
  50% {
    transform: rotate(0deg);
    opacity: 0.25;
  }
  65% {
    transform: rotate(18deg);
    opacity: 0.2;
  }
}

@keyframes tail-sway {
  0%,
  100% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(8deg);
  }
  70% {
    transform: rotate(-6deg);
  }
}

@keyframes ear-twitch {
  0%,
  82%,
  100% {
    transform: rotate(0deg);
  }
  86% {
    transform: rotate(-10deg);
  }
  90% {
    transform: rotate(4deg);
  }
  94% {
    transform: rotate(-3deg);
  }
  98% {
    transform: rotate(0deg);
  }
}

@keyframes whisker-twitch {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(2.5deg);
  }
  65% {
    transform: rotate(-1.5deg);
  }
}

@keyframes eye-blink {
  0%,
  42%,
  58%,
  100% {
    transform: scaleY(1);
  }
  46%,
  54% {
    transform: scaleY(0.08);
  }
}

// Dark mode
[data-theme='dark'] .sumi-cat {
  --sumi-ink: var(--gutenku-zen-accent);
  filter: drop-shadow(0 0.5px 1px oklch(0 0 0 / 0.12));

  .sumi-cat__group {
    opacity: 0.58;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .sumi-cat-container {
    display: none;
  }
}

// Mobile - smaller cat
@media (max-width: 767px) {
  .sumi-cat-container {
    top: -32px;
    height: 40px;
  }

  .sumi-cat {
    width: 48px;
    height: 34px;
  }
}
</style>
