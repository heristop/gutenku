<script lang="ts" setup>
// Ink line art: a shelf of classics, one spine stamped GK. Drawn in the
// same hand as the ink icon set (round caps, slightly bowed strokes).
</script>

<template>
  <svg
    class="plate-shelf"
    viewBox="0 0 200 140"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Shelf plank -->
    <path d="M14 118 C 70 117.2, 130 118.6, 186 117.6" stroke-width="2.2" />
    <path
      d="M18 124 C 72 123.4, 128 124.6, 182 123.8"
      stroke-width="1"
      opacity="0.5"
    />

    <!-- Spines, left to right -->
    <g stroke-width="1.6">
      <path d="M26 117 L 25.4 44 C 30 43.2, 36 43.4, 40 44.2 L 40.6 117" />
      <path
        d="M26 56 C 31 55.4, 36 55.6, 40.2 56.2 M26 104 C 31 103.4, 36 103.6, 40.4 104.2"
        opacity="0.7"
      />

      <path d="M42 117 L 42.6 58 C 48 57.4, 54 57.6, 58 58.4 L 57.6 117" />
      <path d="M45 72 L 55 72" opacity="0.6" />

      <path d="M60 117 L 59.6 36 C 66 35.2, 72 35.6, 77 36.4 L 76.6 117" />
      <path
        d="M60 48 C 66 47.6, 72 47.8, 76.8 48.4 M60 100 C 66 99.4, 72 99.8, 76.8 100.4"
        opacity="0.7"
      />

      <!-- The stamped spine -->
      <path d="M79 117 L 79.4 50 C 86 49.4, 93 49.6, 98 50.4 L 97.6 117" />
      <rect
        x="82.5"
        y="74"
        width="12"
        height="12"
        rx="2"
        fill="var(--gk-stamp, #bc2d29)"
        stroke="none"
      />
      <path d="M85 79.4 h7 M85 82.6 h7" stroke="#f8f4ec" stroke-width="1" />

      <path
        d="M100 117 L 100.4 62 C 105 61.4, 110 61.6, 114 62.4 L 113.6 117"
      />

      <!-- A book leaning on its neighbour -->
      <path d="M117 117 L 136 50 C 141 51, 146 52.6, 150 54.4 L 131.6 118" />
      <path d="M128 70 L 142 74.6" opacity="0.6" />

      <path
        d="M152 117 L 152.4 40 C 158 39.4, 164 39.6, 169 40.4 L 168.6 117"
      />
      <path d="M152.2 54 C 158 53.6, 164 53.8, 168.8 54.4" opacity="0.7" />
      <path d="M156 86 L 165 86 M156 90 L 163 90" opacity="0.5" />
    </g>
  </svg>
</template>
