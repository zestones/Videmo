
export default class AniList {

    constructor() {
        this.url = 'https://graphql.anilist.co';

        this.method = 'POST';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * @param {String} name : The name of the anime to search. 
     * @returns {Object} The anime details.
     */
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
                    return {
                        description: anime.description,
                        genres: anime.genres ? anime.genres : [],
                        startDate: this.formatDate(anime.startDate),
                        duration: this.formatDuration(anime.duration),
                        rating: this.formatRating(anime.meanScore)
                    };
                } else {
                    return null;
                }
            })
            .catch(error => console.error(error));
    }

    /**
     * 
     * @param {String} date 
     * @returns {String} The formatted date.
     */
    formatDate(date) {
        return `${date?.day}/${date?.month}/${date?.year}`;
    }

    /**
     * @param {String} duration - The duration in minutes.
     * @returns {String} The formatted duration.
     */
    formatDuration(duration) {
        const hours = Math.floor(duration / 60);
        const minutes = Math.floor(duration % 60);
        const seconds = Math.floor((duration * 60) % 60);

        const formattedHours = String(hours).padStart(2, "0");
        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    /**
     * @param {String} rating 
     * @returns {String} The formatted rating out of 10. 
     * - With 1 decimal place. if last digit is 0, it is removed.
     */
    formatRating(rating) {
        return `${(rating / 10).toFixed(1).replace(/\.0$/, "")}/10`;
    }
}