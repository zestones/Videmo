import { makeRequest } from "../../../utilities/utils/Utils";

export default class SerieApi {

    // Read all series by category id
    readAllSeriesByCategory(categoryId) {
        return makeRequest("/read/all/series/by/category/", { categoryId: categoryId });
    }

    // Read serie by serie link
    readSerieByLink(link) {
        return makeRequest("/read/serie/by/serie-link/", { link: link });
    }

    // Read serie by serie id
    readSerieById(id) {
        return makeRequest("/read/serie/by/id/", { id: id });
    }

    // Read all series by parent id
    readAllSeriesByParentId(parentId) {
        return makeRequest("/read/all/series/by/parent-id/", { parentId: parentId });
    }

    // Read all series by links
    readAllSeriesByLinks(links) {
        return makeRequest("/read/all/series/by/links/", { links: links });
    }
}
