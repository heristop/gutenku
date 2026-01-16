import type { RouteRecordRaw } from 'vue-router';
import { GAME_ENABLED } from '@/features/game';

export const routes: RouteRecordRaw[] = [
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
      ...(GAME_ENABLED
        ? [
            {
              path: 'game',
              name: 'Game',
              component: () =>
                import(/* webpackChunkName: "game" */ '@/features/game').then(
                  (m) => m.GameView,
                ),
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
            'Free AI haiku generator inspired by classic literature. Create beautiful zen poetry from Project Gutenberg books.',
        },
      },
      {
        path: 'blog',
        name: 'Blog',
        component: () =>
          import(
            /* webpackChunkName: "blog" */ '@/features/blog/views/BlogIndex.vue'
          ),
        meta: {
          title: 'Blog - GutenKu',
          description:
            'Articles about GutenKu, AI haiku generation, genetic algorithms, and classic literature.',
        },
      },
      {
        path: 'blog/:slug',
        name: 'BlogArticle',
        component: () =>
          import(
            /* webpackChunkName: "blog-article" */ '@/features/blog/views/BlogArticle.vue'
          ),
        meta: {
          title: 'Article - GutenKu',
          description: 'Read articles about AI poetry and haiku generation.',
        },
      },
      {
        path: 'verify-email',
        name: 'VerifyEmail',
        component: () =>
          import(
            /* webpackChunkName: "verify-email" */ '@/views/VerifyEmail.vue'
          ),
        meta: {
          title: 'Verify Email - GutenKu',
          description:
            'Confirm your email subscription to receive GutenKu newsletters and updates.',
          robots: 'noindex, nofollow',
        },
      },
      {
        path: 'unsubscribe',
        name: 'Unsubscribe',
        component: () =>
          import(
            /* webpackChunkName: "unsubscribe" */ '@/views/Unsubscribe.vue'
          ),
        meta: {
          title: 'Unsubscribe - GutenKu',
          description:
            'Manage your GutenKu email subscription preferences or unsubscribe from notifications.',
          robots: 'noindex, nofollow',
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
          robots: 'noindex, nofollow',
        },
      },
    ],
  },
];
