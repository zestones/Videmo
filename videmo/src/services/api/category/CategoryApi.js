
export default class CategoryApi {

    // Create a new category
    createCategory(name) {
        window.api.send("/create/category/", { name: name });

        return new Promise((resolve, reject) => {
            window.api.receive("/create/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }

    // Read all categories
    readAllCategories() {
        window.api.send("/read/category/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/category/", (data) => data.success ? resolve(data.categories) : reject(data.error));
        });
    }

    // Delete category by ID
    deleteCategory(id) {
        window.api.send("/delete/category/", { id: id });

        return new Promise((resolve, reject) => {
            window.api.receive("/delete/category/", (data) => data.success ? resolve(data.category) : reject(data.error));
        });
    }
}