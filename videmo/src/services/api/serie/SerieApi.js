export default class SerieApi {

    readAllSeriesByCategory(categoryId) {
        window.api.send("/read/all/series/by/category/", { categoryId: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/series/by/category/", (data) => data.success ? resolve(data.series) : reject(data.error));
        });
    }

    readExtensionBySerieId(serieId) {
        window.api.send("/read/extension/by/serie/id/", { serieId: serieId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/extension/by/serie/id/", (data) => data.success ? resolve(data.extension) : reject(data.error));
        });
    }
}
