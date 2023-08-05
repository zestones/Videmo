export default class SerieApi {

    readAllSeriesByCategory(categoryId) {
        window.api.send("/read/all/series/by/category/", { categoryId: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/series/by/category/", (data) => data.success ? resolve(data.series) : reject(data.error));
        });
    }

    readSerieBySerieObject(link) {
        window.api.send("/read/serie/by/serie-link/", { link: link });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie/by/serie-link/", (data) => data.success ? resolve(data.serie) : reject(data.error));
        });
    }
}
