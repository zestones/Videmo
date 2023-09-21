import { FILTERS_FIELDS, FLAGS as FILTERS_FLAGS } from "../utils/Constants";

class FilterManager {

    filterSeriesByFilters(series, filters) {
        let filteredSeries = [...series];

        for (const filter of filters) {
            filteredSeries = this.applyFilter(filteredSeries, filter);
        }

        return filteredSeries;
    }

    applyFilter(series, filter) {
        switch (filter.name) {
            case FILTERS_FIELDS.UNWATCHED:
                return this.filterByFlag(
                    series,
                    filter.flag,
                    (serie) => serie.infos.total_viewed_episodes === 0
                );

            case FILTERS_FIELDS.WATCHED:
                return this.filterByFlag(
                    series,
                    filter.flag,
                    (serie) => serie.infos.total_viewed_episodes > 0
                );

            case FILTERS_FIELDS.FINISHED:
                return this.filterByFlag(
                    series,
                    filter.flag,
                    (serie) => serie.infos.total_viewed_episodes === serie.infos.number_of_episodes
                );


            // TODO : implement downloaded filter
            // case FILTERS_FIELDS.DOWNLOADED:
            //     return series;

            default:
                return series;
        }
    }

    filterByFlag(series, flag, filterFunction) {
        if (flag === FILTERS_FLAGS.INCLUDE) {
            return series.filter(filterFunction);
        } else if (flag === FILTERS_FLAGS.EXCLUDE) {
            return series.filter((serie) => !filterFunction(serie));
        }

        return series;
    }
}

export default FilterManager;
