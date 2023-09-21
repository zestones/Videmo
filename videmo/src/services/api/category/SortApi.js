class SortApi {

    getAllSortsEntries() {
        window.api.send("/read/sorts/");

        return new Promise((resolve, reject) => {
            window.api.receive("/read/sorts/", (data) => data.success ? resolve(data.sorts) : reject(data.error));
        });
    }
}

export default SortApi;
