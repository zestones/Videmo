
export default class CategoryApi {

    // Create a new category
    createCategory(name) {
        window.api.send("/create/category/", { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive("/create/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // read categories by serie id
    readSerieCategoryIdsBySerie(serie) {
        window.api.send("/read/serie-categories/by/serie", { serie: serie });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie-categories/by/serie", (data) => data.success ? resolve(data.categories) : reject(data.error));
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

    // Delete category by ID
    deleteCategory(id) {
        window.api.send("/delete/category/", { id: id });

        return new Promise((resolve, reject) => {
            window.api.receive("/delete/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // Add Serie to Categories
    addSerieToCategories(serie, categoriesId = [1]) {
        // TODO : check if the genres is present in the serie and if not retrieve the serie genres with aniList API
        window.api.send("/add/categories/to/serie", { serie: JSON.stringify(serie), categoriesId: categoriesId });

        return new Promise((resolve, reject) => {
            window.api.receive("/add/categories/to/serie", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }
}