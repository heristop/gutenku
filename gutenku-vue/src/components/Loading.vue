<script lang="ts" setup>
import { onMounted } from 'vue';

const icons: string[] = [
    'mdi-robot-confused-outline',
    'mdi-robot-outline',
    'mdi-robot-happy-outline',
    'mdi-robot-excited-outline',
    'mdi-robot-love-outline',
];

const startAnimation = () => {
    const icons = document.querySelectorAll('.loading i');
    let index = 0;

    icons[index].classList.add('active');

    setInterval(() => {
        icons[index].classList.remove('active')
        index = (index + 1) % icons.length
        icons[index].classList.add('active')
    }, 500);
};

onMounted(startAnimation);
</script>

<template>
  <div class="loading">
    <v-icon
      v-for="(icon, index) in icons"
      :key="index"
      :class="['icon']"
      color="primary"
    >
      {{ icon }}
    </v-icon>

    <v-spacer class="pa-10" />

    <v-sheet
      class="loading-text px-6 py-2"
      color="primary"
    >
      Generating Haiku...
    </v-sheet>
  </div>
</template>
  
<style scoped>
.loading {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.loading .icon.active {
    opacity: 1;
}

.loading .icon {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 48px;
    margin: 0 auto;
    animation: slide-in 1s ease-out infinite;
    opacity: 0;
}

.loading-text {
    font-family: Garamond, Georgia, serif;
    font-size: 20px;
}
</style>
