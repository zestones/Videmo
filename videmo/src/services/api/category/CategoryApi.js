
export default class CategoryApi {

    // Create a new category
    createCategory(name) {
        window.api.send("/create/category/", { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive("/create/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // read categories by serie id
    readSerieCategoryIdsBySerieLink(link) {
        window.api.send("/read/serie-categories/by/serie/link/", { link: link });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie-categories/by/serie/link/", (data) => data.success ? resolve(data.categories) : reject(data.error));
        });
    }

    // Read all serie categories by serie link array
    readSerieCategoryIdsBySerieLinkArray(links) {
        window.api.send("/read/serie-categories/by/serie/link/array/", { links: links });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie-categories/by/serie/link/array/", (data) => data.success ? resolve(data.categories) : reject(data.error));
        });
    }

    readAllSeriesInLibraryByExtension(extension) {
        window.api.send("/read/all/series/in/library/by/extension", { extension: extension });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/series/in/library/by/extension", (data) => data.success ? resolve(data.series) : reject(data.error));
        });
    }

    // Read all categories
    readAllCategories() {
        window.api.send("/read/all/categories/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/all/categories/", (data) => data.success ? resolve(data.categories) : reject(data.error));
        });
    }

    updateCategory(category) {
        window.api.send("/update/category/", { category: JSON.stringify(category) });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // Delete category by ID
    deleteCategory(id) {
        window.api.send("/delete/category/", { id: id });

        return new Promise((resolve, reject) => {
            window.api.receive("/delete/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // Add Serie to Categories
    addSerieToCategories(series, associationSerieCategory, shouldUpdateSeries) {
        if(!Array.isArray(series)) series = [series];

        window.api.send("/add/categories/to/serie/", { series: series, associationSerieCategory: associationSerieCategory, shouldUpdateSeries: shouldUpdateSeries  });

        return new Promise((resolve, reject) => {
            window.api.receive("/add/categories/to/serie/", (data) => data.success ? resolve(data.categories) : reject(data.error));
        });
    }

    // Read last opened category
    readLastOpenedCategory() {
        window.api.send("/read/last/opened/category/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/last/opened/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    updateLastOpenedCategory(categoryId) {
        window.api.send("/update/last/opened/category/", { id: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/last/opened/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }
}