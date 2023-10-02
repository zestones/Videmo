import { makeRequest } from "../../../utilities/utils/Utils";


export default class CategoryApi {

    // Create a new category
    createCategory(name, orderId) {
        return makeRequest("/create/category/", { name: name, order_id: orderId });
    }

    // Read all categories
    readAllCategories() {
        return makeRequest("/read/all/categories/");
    }

    // Read all serie categories by serie link array
    readSerieCategoryIdsBySerieLinkArray(links) {
        return makeRequest("/read/serie-categories/by/serie/link/array/", { links: links });
    }

    // Read all series in library by extension
    readAllSeriesInLibraryByExtension(extension) {
        return makeRequest("/read/all/series/in/library/by/extension/", { extension: extension });
    }

    // read categories by serie id
    readSerieCategoryIdsBySerieLink(link) {
        return makeRequest("/read/serie-categories/by/serie/link/", { link: link });
    }

    // Read last opened category
    readLastOpenedCategory() {
        return makeRequest("/read/last/opened/category/");
    }

    // Update category
    updateCategory(category) {
        return makeRequest("/update/category/", { category: category });
    }

    // Update categories order
    updateCategoriesOrder(categories) {
        return makeRequest("/update/categories/order/", { categories: JSON.stringify(categories) });
    }

    // Update last opened category
    updateLastOpenedCategory(categoryId) {
        return makeRequest("/update/last/opened/category/", { id: categoryId });
    }

    // Add Serie to Categories
    addSerieToCategories(series, associationSerieCategory, shouldUpdateSeries) {
        if (!Array.isArray(series)) series = [series];
        return makeRequest("/add/categories/to/serie/", { series: series, associationSerieCategory: associationSerieCategory, shouldUpdateSeries: shouldUpdateSeries });
    }

    // Delete category by ID
    deleteCategory(id) {
        return makeRequest("/delete/category/", { id: id });
    }
}