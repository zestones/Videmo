import { makeRequest } from "../../../utilities/utils/Utils";

class CategoryFilterApi {

    // Get filters by category id
    getFiltersByCategoryId(categoryId) {
        return makeRequest("/read/filters/by/category-id/", { categoryId: categoryId });
    }

    // Update category filter
    updateCategoryFilter(categoryFilter, categoryId) {
        return makeRequest("/update/category-filter/by/category-id/", { categoryFilter: categoryFilter, categoryId: categoryId });
    }
}

export default CategoryFilterApi;