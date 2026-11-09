<script setup lang="ts">
import { computed, ref } from 'vue';
import { bookmojiGlyph } from '@gutenku/shared';
import catalogue from './catalogue.json';
import { bookmojiUrl } from '@/assets/bookmoji';
import reserve from './reserve.json';
import creditsUrl from './credits.txt?url';

const query = ref('');
const gameSize = ref(false);
function searchable(value: string) {
  return value
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replaceAll(/\p{M}/gu, '');
}

const groups = [
  ...catalogue,
  {
    title: 'Réserve pour les prochains livres',
    marks: reserve,
  },
].map(({ title, marks }) => ({
  title,
  isReserve: marks === reserve,
  marks: Object.entries(marks).map(([id, label]) => {
    const glyph = bookmojiGlyph(id) ?? '';
    return {
      id,
      label,
      url: bookmojiUrl(glyph),
      search: searchable(label + ' ' + glyph),
    };
  }),
}));
const filtered = computed(() => {
  const term = searchable(query.value.trim());
  return groups
    .map(({ title, marks, isReserve }) => ({
      title,
      isReserve,
      marks: marks.filter((mark) => mark.search.includes(term)),
    }))
    .filter(({ marks }) => marks.length);
});
const count = computed(() =>
  filtered.value.reduce((sum, group) => sum + group.marks.length, 0),
);
</script>

<template>
  <article class="gallery" lang="fr">
    <header class="gallery-title">
      <h1>La planche des Bookmoji</h1>
      <p>Édition naturaliste</p>
    </header>
    <div class="controls">
      <label
        >Rechercher un motif
        <input v-model="query" type="search" placeholder="Nom ou emoji" />
      </label>
      <label class="size"
        ><input v-model="gameSize" type="checkbox" /> Taille du jeu (32
        px)</label
      >
    </div>
    <p class="count" role="status">
      {{ count }} motif{{ count > 1 ? 's' : '' }}
    </p>
    <div class="sheets" :class="{ 'game-size': gameSize }">
      <section
        v-for="group in filtered"
        :key="group.title"
        :id="group.isReserve ? 'reserve' : undefined"
      >
        <h2>
          {{ group.title }} <small>{{ group.marks.length }}</small>
        </h2>
        <ul>
          <li v-for="mark in group.marks" :key="mark.id">
            <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
              <use :href="mark.url" width="36" height="36" />
            </svg>
            <span>{{ mark.label }}</span>
          </li>
        </ul>
      </section>
      <p v-if="!count">Aucun motif ne correspond à cette recherche.</p>
    </div>
    <a class="credits" :href="creditsUrl"
      >Crédits des illustrations et des libellés</a
    >
  </article>
</template>

<style scoped>
.gallery {
  width: min(100%, 68rem);
  margin-inline: auto;
  padding: clamp(1rem, 4vw, 3rem);
  color: var(--gk-ink);
  font-family: var(--gk-font);
}
.gallery-title,
h2 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.375rem 1rem;
}
.gallery-title {
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--gk-ink);
}
.gallery-title p {
  margin: 0;
  color: var(--gk-ink-soft);
}
h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.1;
}
.controls {
  display: flex;
  gap: 0.75rem 1.5rem;
  align-items: end;
  flex-wrap: wrap;
  margin: 1.25rem 0 0.5rem;
}
.controls label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.controls input[type='search'] {
  width: min(18rem, 100%);
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gk-ink-soft);
  border-radius: var(--gk-radius-control);
  font: inherit;
  color: inherit;
  background: var(--gk-paper-raised);
}
.controls .size {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 44px;
  cursor: pointer;
}
.size input {
  accent-color: var(--gk-indigo);
}
.controls input:focus-visible,
.credits:focus-visible {
  outline: 2px solid var(--gk-indigo);
  outline-offset: 3px;
}
.count,
h2 small {
  font-size: 0.875rem;
  color: var(--gk-ink-soft);
}
.sheets {
  display: grid;
  gap: 1rem;
}
section {
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background: var(--gk-paper-raised);
  box-shadow: 1px 3px 5px var(--gk-ink-faint);
}
h2 {
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: var(--gk-rule);
  font-size: clamp(1.2rem, 2vw, 1.6rem);
}
ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 5.4rem), 1fr));
  gap: 1rem 0.4rem;
  padding: 1rem 0 0;
  margin: 0;
  list-style: none;
}
li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}
li span {
  font:
    0.875rem/1.15 Georgia,
    serif;
  overflow-wrap: anywhere;
}
li svg {
  display: block;
  width: 48px;
  height: 48px;
}
.game-size li svg {
  width: 32px;
  height: 32px;
}
[data-theme='dark'] .sheets {
  --bm-natural-outline: #d3bfa7;
}
.credits {
  display: inline-block;
  padding-block: 1rem;
  color: var(--gk-ink-soft);
  font-size: 0.8125rem;
}
</style>
