// Composables
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import { GAME_ENABLED, GameView } from '@/features/game';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/core/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () =>
          import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
        meta: {
          title: 'GutenKu - AI Haiku Generator & Literary Games',
          description:
            'Generate beautiful haikus from classic literature using AI. Play GutenGuess daily!',
        },
      },
      ...(GAME_ENABLED && GameView
        ? [
            {
              path: 'game',
              name: 'Game',
              component: GameView,
              meta: {
                title: 'GutenGuess - Daily Book Guessing Game',
                description:
                  'Guess the classic book from emoji hints. A daily literary puzzle similar to Wordle.',
              },
            },
          ]
        : []),
      {
        path: 'haiku',
        name: 'Haiku',
        component: () =>
          import(
            /* webpackChunkName: "haiku" */ '@/features/haiku/views/Haiku.vue'
          ),
        meta: {
          title: 'Haiku Generator - GutenKu',
          description:
            'Create haikus inspired by classic literature from Project Gutenberg.',
        },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () =>
          import(/* webpackChunkName: "not-found" */ '@/views/NotFound.vue'),
        meta: {
          title: 'Page Not Found - GutenKu',
          description: 'The requested page was not found.',
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
