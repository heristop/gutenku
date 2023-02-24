import axios from 'axios';
import dotenv from 'dotenv';
import { defineStore } from 'pinia';
import { HaikuValue } from '../types';

dotenv.config();

const query = `
    query Query($useAi: Boolean) {
        haiku(useAI: $useAi) {
            book {
                title
                author
            }
            verses
            rawVerses
            image
            title
            description
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
        useAI: false as boolean,
        error: '' as string
    }),
    actions: {
        async fetchText() {
            try {
                this.loading = true;
                this.error = '';

                const variables = {
                    useAi: this.useAI
                };

                const body = {
                    query: query,
                    variables: variables,
                    timeout: 300,
                };

                const response = await axios.post(process.env.SERVER_URI || 'http://localhost:4000/graphql', body);

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
