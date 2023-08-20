import { defineStore } from 'pinia';
import { HaikuValue } from '@/types';
import { gql } from '@apollo/client/core';
import { apolloClient } from '@/client';

const query = gql`
    query Query($useAi: Boolean, $theme: String) {
        haiku(useAI: $useAi, theme: $theme) {
            book {
                title
                author
            }
            chapter {
                content
                title
            }
            useCache
            verses
            rawVerses
            image
            title
            description
            executionTime
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
        theme: 'watermark' as string,
        error: '' as string,
    }),
    actions: {
        async fetchText() {
            try {
                this.loading = true;
                this.error = '';

                const variables = {
                    useAi: this.useAI,
                    appendImg: true,
                    theme: this.theme
                };

                const { data, errors } = await apolloClient.query({
                    query: query,
                    variables: variables,
                    fetchPolicy: 'no-cache'
                });

                this.haiku = data.haiku;

                if (errors && errors.length > 0) {
                    this.error = errors[0].message;
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
