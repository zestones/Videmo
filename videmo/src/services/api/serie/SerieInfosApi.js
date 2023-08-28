export default class SerieApi {

    async readSerieInfosById(id) {
        window.api.send("/read/serie-infos/by/id/", { id: id });

        return new Promise((resolve, reject) => {
            window.api.receive("/read/serie-infos/by/id/", (data) => data.success ? resolve(data.infos) : reject(data.error));
        });
    }
}