
export default class AniList {

    constructor() {
        this.url = 'https://graphql.anilist.co';

        this.method = 'POST';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    searchAnimeDetailsByName(name) {
        const query = `
                query ($search: String) {
                    Page {
                        media (search: $search, type: ANIME) {
                        id
                        title { english }
                        coverImage { extraLarge }
                        description
                        startDate {
                            year
                            month
                            day
                        }
                        duration
                        genres
                        meanScore
                    }
                }
            }
        `;

        const variables = { search: name };
        const options = {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify({ query: query, variables: variables })
        };

        return fetch(this.url, options)
            .then(response => response.json())
            .then(data => {
                const anime = data?.data?.Page?.media?.[0];
                if (anime) {
                    const { id, title, coverImage, description, startDate, duration, genres, meanScore } = anime;
                    return {
                        id,
                        title: title?.english,
                        coverImage: coverImage?.extraLarge,
                        description,
                        startDate,
                        duration,
                        genres,
                        meanScore
                    };
                } else {
                    return null;
                }
            })
            .catch(error => console.error(error));
    }

    formatDate(date) {
        return `${date?.day}/${date?.month}/${date?.year}`;
    }

    formatDuration(duration) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return `${hours}h ${minutes}min`;
    }

    formatRating(rating) {
        return `${Math.floor(rating / 10)}/10`;
    }   
}