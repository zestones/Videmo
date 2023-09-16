class CategoryFilterApi {

    getFiltersByCategoryId(categoryId) {
        window.api.send("/read/filters/by/category-id/", { categoryId: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/filters/by/category-id/", (data) => data.success ? resolve(data.filters) : reject(data.error));
        });
    }


    updateCategoryFilter(categoryFilter, categoryId) {
        window.api.send("/update/category-filter/by/category-id/", { categoryFilter: categoryFilter, categoryId: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/update/category-filter/by/category-id/", (data) => data.success ? resolve(data.categoryFilter) : reject(data.error));
        });
    }
}

export default CategoryFilterApi;