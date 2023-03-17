<script lang="ts" setup />

<template>
  <v-card class="mx-auto order-4">
    <v-img
      lazy-src="@/assets/img/duel.jpg"
      src="@/assets/img/duel.jpg"
      cover
    />

    <v-footer
      class="justify-right"
      color="third"
    >
      <small>{{ new Date().getFullYear() }} — <strong>heristop</strong></small>
    </v-footer>
  </v-card>
</template>
