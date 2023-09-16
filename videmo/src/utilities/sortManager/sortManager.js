import { SORTS_FIELDS, FLAGS as SORT_FLAGS } from "../utils/Constants";

class SortManager {

    filterByKeyword(keyword, object, ...keys) {
        return object.filter((element) => {
            for (const key of keys) {
                if (this.filterNestedString(keyword, element, key)) {
                    return true;
                }
            }
            return false;
        });
    }

    filterNestedString(keyword, object, key) {
        const keyParts = key.split('.');

        let value = object;
        for (const part of keyParts) {
            value = value[part];
            if (!value) return false;
        }

        return this.filterString(keyword, value);
    }

    filterString(keyword, value) {
        return value.toLowerCase().includes(keyword.toLowerCase());
    }

    /** ****************************************** *
     *       SORT USED INSIDE THE FILTER PANEL     *  
     * ******************************************* */

    sortStringByKeys(object, reverse = false, ...keys) {
        return object.sort((a, b) => {
            for (const key of keys) {
                const valueA = this.getNestedValue(a, key);
                const valueB = this.getNestedValue(b, key);

                if (valueA < valueB) return reverse ? 1 : -1;
                if (valueA > valueB) return reverse ? -1 : 1;
            }
            return 0;
        });
    }

    getNestedValue(object, key) {
        const keyParts = key.split('.');

        let value = object;
        for (const part of keyParts) {
            value = value[part];
            if (!value) return '';
        }

        return value;
    }

    sortDates(object, reverse = false, ...keys) {
        return object.sort((a, b) => {
            for (const key of keys) {
                const valueA = this.getNestedValue(a, key);
                const valueB = this.getNestedValue(b, key);

                return reverse ? new Date(valueA) - new Date(valueB) : new Date(valueB) - new Date(valueA);
            }
            return 0;
        });
    }

    sortNumbers(object, reverse = false, ...keys) {
        return object.sort((a, b) => {
            for (const key of keys) {
                const valueA = this.getNestedValue(a, key);
                const valueB = this.getNestedValue(b, key);

                return reverse ? valueB - valueA : valueA - valueB;
            }
            return 0;
        });
    }

    sortSeriesByField(object, field, reverse) {
        reverse = reverse === SORT_FLAGS.DESC;
        if (field === SORTS_FIELDS.ALPHABETICAL) {
            return this.sortStringByKeys(object, reverse, "basename", "name");
        } else if (field === SORTS_FIELDS.RELEASE_DATE) {
            return this.sortDates(object, reverse, "infos.release_date");
        } else if (field === SORTS_FIELDS.RATING) {
            return this.sortNumbers(object, reverse, "infos.rating");
        } else if (field === SORTS_FIELDS.NUMBER_OF_EPISODES) {
            return this.sortNumbers(object, reverse, "infos.number_of_episodes");
        }

        return object;
    }
}

export default SortManager;