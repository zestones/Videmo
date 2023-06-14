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

    // TODO: do the check with unique constraint on a column in the database
    // TODO: the basename is ABSOLUTELY not unique nor the name
    // TODO: possible solution: add a unique constraint on the name AND basename AND extension_id AND link columns ?
    readSerieByName(name) {
        window.api.send("/read/serie/by/name/", { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie/by/name/", (data) => data.success ? resolve(data.serie) : reject(data.error));
        });
    }
}
