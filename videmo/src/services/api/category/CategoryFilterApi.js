class CategoryFilterApi {

    getFiltersByCategoryId(categoryId) {
        window.api.send("/read/filters/by/category-id/", { categoryId: categoryId });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/filters/by/category-id/", (data) => data.success ? resolve(data.filters) : reject(data.error));
        });
    }
}

export default CategoryFilterApi;