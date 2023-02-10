import axios from 'axios';

export default {
    async fetch() {
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

        const response = await axios.post('http://localhost:4000/graphql', { query });

        return response.data.data.haiku;
    }
};
