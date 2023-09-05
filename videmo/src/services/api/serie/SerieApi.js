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

    readSerieById(id) {
        window.api.send("/read/serie/by/id/", { id: id });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie/by/id/", (data) => data.success ? resolve(data.serie) : reject(data.error));
        });
    }

    readAllSeriesByParentId(parentId) {
        window.api.send("/read/all/series/by/parent-id/", { parentId: parentId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/series/by/parent-id/", (data) => data.success ? resolve(data.series) : reject(data.error));
        });
    }

    readAllSeriesByLinks(links) {
        window.api.send("/read/all/series/by/links/", { links: links });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/series/by/links/", (data) => data.success ? resolve(data.series) : reject(data.error));
        });
    }
}
