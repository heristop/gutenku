<script lang="ts" setup>
// Ink line art: an open book with three short lines written on the right page
// and a quill resting across it. Same hand as the ink icon set.
</script>

<template>
  <svg
    class="plate-quill"
    viewBox="0 0 200 140"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Open book: two pages bowing toward the gutter -->
    <g stroke-width="1.7">
      <path
        d="M100 42 C 82 34, 52 32, 22 38 L 24 112 C 52 106, 80 108, 100 116"
      />
      <path
        d="M100 42 C 118 34, 148 32, 178 38 L 176 112 C 148 106, 120 108, 100 116"
      />
      <path d="M100 42 L 100 116" />
      <path
        d="M24 112 C 52 108, 80 110, 100 119 C 120 110, 148 108, 176 112"
        opacity="0.55"
      />
    </g>

    <!-- Left page: printed text, faint -->
    <g stroke-width="1" opacity="0.45">
      <path d="M34 52 C 54 49.6, 74 50, 90 52.6" />
      <path d="M34 60 C 54 57.6, 74 58, 90 60.6" />
      <path d="M34 68 C 54 65.6, 72 66, 86 68.4" />
      <path d="M34 76 C 54 73.6, 74 74, 90 76.6" />
      <path d="M34 84 C 50 82, 66 82.2, 78 84" />
    </g>

    <!-- Right page: three written lines, in a looser hand -->
    <g stroke-width="1.4">
      <path
        d="M112 56 C 118 52, 122 60, 128 55 S 138 52, 144 56 S 154 58, 160 55"
      />
      <path
        d="M118 70 C 124 66, 128 74, 134 69 S 144 66, 150 70 S 160 72, 166 69"
      />
      <path d="M112 84 C 118 80, 122 88, 128 83 S 138 80, 146 84" />
    </g>

    <!-- Quill resting across the right page -->
    <g stroke-width="1.5">
      <path
        d="M150 96 C 160 80, 172 62, 188 40 C 186 54, 180 68, 168 82 C 162 89, 156 93, 150 96 Z"
        fill="var(--plate-leaf, #f6f0e4)"
      />
      <path d="M150 96 C 160 82, 172 64, 188 40" />
      <path
        d="M160 84 l 5 -1 M165 76 l 6 -1.4 M170 68 l 6 -1.8 M176 59 l 5 -2"
        stroke-width="1"
        opacity="0.6"
      />
      <path d="M150 96 L 146 102" />
      <circle cx="145" cy="103.4" r="1.4" fill="currentColor" stroke="none" />
    </g>
  </svg>
</template>
