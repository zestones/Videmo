
export default class CategoryApi {

    // Create a new category
    createCategory(name) {
        window.api.send("/create/category/", { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive("/create/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // read categories by serie id
    readCategoriesBySerieName(serieName) {
        window.api.send("/read/categories/by/serie/id/", { serieName: serieName });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/categories/by/serie/id/", (data) => data.success ? resolve(data.categories) : reject(data.error));
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
            window.api.send("/add/serie/to/categories/", { serie: JSON.stringify(serie), categoriesId: categoriesId });
    
            return new Promise((resolve, reject) => {
                window.api.receive("/add/serie/to/categories/", (data) => data.success ? resolve(data.category) : reject(data.error));
            });
        }
}