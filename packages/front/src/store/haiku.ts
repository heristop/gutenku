import { defineStore } from 'pinia';
import { HaikuValue } from '@/types';
import { gql } from '@apollo/client/core';
import { apolloClient } from '@/client';
import { GraphQLError } from 'graphql';

const query = gql`
    query Query(
        $useAi: Boolean, 
        $useCache: Boolean, 
        $theme: String, 
        $filter: String,
        $sentimentMinScore: Float,
        $markovMinScore: Float,
        $promptTemperature: Float,
        $descriptionTemperature: Float) {
        haiku(
            useAI: $useAi, 
            useCache: $useCache, 
            theme: $theme, 
            filter: $filter,
            sentimentMinScore: $sentimentMinScore,
            markovMinScore: $markovMinScore,
            promptTemperature: $promptTemperature,
            descriptionTemperature: $descriptionTemperature
        ) {
            book {
                title
                author
            }
            chapter {
                content
                title
            }
            verses
            rawVerses
            image
            title
            description
            cacheUsed
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
        error: '' as string,
        optionUseCache: true as boolean,
        optionUseAI: false as boolean,
        optionTheme: 'watermark' as string,
        optionFilter: '' as string,
        optionMinSentimentScore: 0.1 as number,
        optionMinMarkovScore: 0.1 as number,
        optionPromptTemperature: 0.7 as number,
        optionDescriptionTemperature: 0.3 as number,
    }),
    persist: {
        storage: sessionStorage,
        paths: [
            'optionUseCache',
            'optionUseAI',
            'optionTheme',
            'optionMinSentimentScore',
            'optionMinMarkovScore',
            'optionPromptTemperature',
            'optionDescriptionTemperature',
        ],
    },
    getters: {
        networkError: (state) => 'network-error' === state.error,
        notificationError: (state) => '' !== state.error,
    },
    actions: {
        async fetchText() {
            try {
                this.loading = true;
                this.error = '';

                const variables = {
                    useAi: this.optionUseAI,
                    useCache: this.optionUseCache,
                    theme: this.optionTheme,
                    filter: this.optionFilter,
                    sentimentMinScore: this.optionMinSentimentScore,
                    markovMinScore: this.optionMinMarkovScore,
                    promptTemperature: this.optionPromptTemperature,
                    descriptionTemperature: this.optionDescriptionTemperature,
                    appendImg: true,
                };

                const { data } = await apolloClient.query({
                    query: query,
                    variables: variables,
                    fetchPolicy: 'no-cache'
                });

                this.haiku = data.haiku;
            } catch (error: unknown) {
                const graphQLError = error as GraphQLError;

                this.error = 'network-error';

                if (true === this.firstLoaded && 'max-attempts-error' === graphQLError.message) {
                    this.error = '🤖 I could not find a haiku that matches your filters after maximum attempts. ';
                    this.error += 'Please try again with a different filter or try several words.';
                }
            } finally {
                this.firstLoaded = true;
                this.loading = false;
            }
        }
    },
});
