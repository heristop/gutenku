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
            image
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
                this.error = '';
                const response = await axios.post(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
                    query,
                    timeout: 300
                });

                this.haiku = response.data.data.haiku;

                if (null === this.haiku) {
                    this.error = response.data.errors[0].message;
                }
            } catch (error) {
                this.error = error as string;
            } finally {
                this.loading = false;
            }
        }
    }
});