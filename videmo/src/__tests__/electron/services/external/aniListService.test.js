// Services
import AniListService from "../../../../electron/services/external/AniListService";


describe("AniListService", () => {
    // Test case 1: Ensure the class constructor sets the correct initial properties
    test("constructor sets initial properties correctly", () => {
        const aniList = new AniListService();
        expect(aniList.url).toBe("https://graphql.anilist.co");
        expect(aniList.method).toBe("POST");
        expect(aniList.headers).toEqual({
            "Content-Type": "application/json",
            "Accept": "application/json",
        });
    });

    // Test case 2: Test the #formatDate method
    test("formatDate method formats date correctly", () => {
        const aniList = new AniListService();
        const date = { year: 2023, month: 8, day: 5 };
        expect(aniList.formatDate(date)).toBe("5/8/2023");
    });

    // Test case 3: Test the #formatDuration method
    test("formatDuration method formats duration correctly", () => {
        const aniList = new AniListService();
        const duration1 = 125; // 2 hours 5 minutes 0 seconds
        const duration2 = 60;  // 1 hour 0 minutes 0 seconds
        const duration3 = 125.45; // 2 hours 5 minutes 27 seconds
        expect(aniList.formatDuration(duration1)).toBe("02:05:00");
        expect(aniList.formatDuration(duration2)).toBe("01:00:00");
        expect(aniList.formatDuration(duration3)).toBe("02:05:27");
    });

    // Test case 4: Test the #formatRating method
    test("formatRating method formats rating correctly", () => {
        const aniList = new AniListService();
        const rating1 = 80;
        const rating2 = 43;
        const rating3 = 100;
        expect(aniList.formatRating(rating1)).toBe("8");
        expect(aniList.formatRating(rating2)).toBe("4.3");
        expect(aniList.formatRating(rating3)).toBe("10");
    });

    // Test case 5: Test the searchAnimeDetailsByName method (use a mocked fetch response)
    test("searchAnimeDetailsByName method returns correct anime details", async () => {
        const animeName = "My Hero Academia"; // Replace with an actual anime name you want to test

        // Mock the fetch response
        const mockResponse = {
            data: {
                Page: {
                    media: [
                        {
                            id: 1234,
                            title: { english: "My Hero Academia" },
                            description: "A great anime",
                            startDate: { year: 2016, month: 4, day: 3 },
                            duration: "24",
                            genres: ["Action", "Superpower"],
                            meanScore: 86, // Out of 100
                        },
                    ],
                },
            },
        };
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve(mockResponse),
        });

        const aniList = new AniListService();
        const animeDetails = await aniList.searchAnimeInfosName(animeName);

        expect(animeDetails).toEqual({
            description: "A great anime",
            genres: [{ name: "Action" }, { name: "Superpower" }],
            release_date: "3/4/2016",
            duration: "00:24:00",
            rating: "8.6",
        });
    });

    // Test case 6: Test the searchAnimeDetailsByName method for a non-existent anime
    test("searchAnimeDetailsByName method returns null for non-existent anime", async () => {
        const nonExistentAnime = "Some random anime that does not exist"; // Replace with an anime name that does not exist

        // Mock the fetch response for a non-existent anime
        const mockResponse = { data: { Page: { media: [] } } };
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve(mockResponse),
        });

        const aniList = new AniListService();
        const animeDetails = await aniList.searchAnimeInfosName(nonExistentAnime);

        expect(animeDetails).toBeNull();
    });
});
