class FilterApi {

    getAllFiltersEntries() {
        window.api.send("/read/filters/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/filters/", (data) => data.success ? resolve(data.filters) : reject(data.error));
        });
    }
}

export default FilterApi;
