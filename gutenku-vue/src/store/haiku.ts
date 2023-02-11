import axios from 'axios';
import { defineStore } from 'pinia';
import { HaikuValue } from '@/types';

const query = `
    query {
        haiku {
            book {
                title
                author
            }
            verses
            raw_verses
            chapter {
                content
                title
            }
        }
    }
`;

export const useHaikuStore = defineStore({
    id: 'haiku',
    state: () => ({
        haiku: null as unknown as HaikuValue,
        loading: false as boolean,
        error: '' as string
    }),
    actions: {
        async fetchText() {
            try {
                this.loading = true;
                const response = await axios.post('http://localhost:4000/graphql', {
                    query,
                    timeout: 300
                });

                this.haiku = response.data.data.haiku;
            } catch (error) {
                this.error = 'Network error';
            } finally {
                this.loading = false;
            }
        }
    }
});