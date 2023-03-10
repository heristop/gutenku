import axios from 'axios';
import { defineStore } from 'pinia';
import { HaikuValue } from '../types';

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
        firstLoaded: false as boolean,
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

                const envServerUri = import.meta.env.VITE_SERVER_URI || 'http://localhost:4000/graphql';
                const response = await axios.post(envServerUri, body);

                this.haiku = response.data.data.haiku;

                if (null === this.haiku) {
                    this.error = response.data.errors[0].message;
                }
            } catch (error) {
                this.error = error as string;
            } finally {
                this.firstLoaded = true;
                this.loading = false;
            }
        }
    }
});
