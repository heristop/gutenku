<script lang="ts">
import { ref, computed } from 'vue';

export default {
    props: {
        text: {
            type: String,
            required: false,
            default: ''
        },
        color: {
            type: String,
            required: false,
            default: 'primary'
        },
        error: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props) {
        const icons = ref([
            'mdi-robot-confused-outline',
            'mdi-robot-outline',
            'mdi-robot-happy-outline',
            'mdi-robot-excited-outline',
            'mdi-robot-love-outline',
        ]);

        const flipIcons = computed(() => {
            return false === props.error;
        });

        return {
            icons,
            flipIcons
        };
    },
    mounted() {
        const icons = document.querySelectorAll('.loading i.flip');
        let index = 0;

        icons[index].classList.add('active');

        setInterval(() => {
            icons[index].classList.remove('active')
            index = (index + 1) % icons.length
            icons[index].classList.add('active')
        }, 500);
    }
};
</script>

<template>
  <div class="loading">
    <v-icon
      v-show="error"
      :color="color"
      :class="['icon', 'active']"
    >
      mdi-robot-dead-outline
    </v-icon>

    <div v-if="flipIcons">
      <v-icon
        v-for="(icon, index) in icons"
        :key="index"
        :class="['flip', 'icon']"
        :color="color"
      >
        {{ icon }}
      </v-icon>
    </div>

    <div v-if="text">
      <v-spacer class="pa-10" />

      <v-sheet
        class="loading-text px-4 py-1"
        color="primary"
      >
        {{ text }}
      </v-sheet>

      <v-progress-linear
        :indeterminate="flipIcons"
        color="primary"
        class="mb-0"
      />
    </div>
  </div>
</template>
  
<style scoped>
@import '@/assets/css/fonts.css';

.loading {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loading .icon.active {
  opacity: 0.75;
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
  font-family: 'Typewriter', serif;
  font-size: 18px;
  opacity: 0.9;
}
</style>
