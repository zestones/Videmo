import React, { useEffect, useMemo, useState } from "react";


// Constants
import { FLAGS as FILTER_FLAGS, FILTERS_FIELDS } from "../../../utilities/utils/Constants";

// Api services
import FilterApi from "../../../services/api/category/FilterApi";
import CategoryFilterApi from "../../../services/api/category/CategoryFilterApi";

// Styles
import styles from "./FilterContent.module.scss";


function FilterContent({ currentCategory, onFilter }) {
    // Services initialization
    const categoryFilterApi = useMemo(() => new CategoryFilterApi(), []);
    const filterApi = useMemo(() => new FilterApi(), []);

    // State initialization
    const [checkboxStates, setCheckboxStates] = useState({});
    const [selectedFilterField, setSelectedFilterField] = useState();
    const [filterTyper, setFilterType] = useState();
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        filterApi.getAllFiltersEntries()
            .then((filters) => setFilters(filters))
            .catch((err) => console.error(err));

        categoryFilterApi.getFiltersByCategoryId(currentCategory.id)
            .then((filters) => {
                setSelectedFilterField(filters.filter.name);
                setFilterType(filters.filter.flag);
            })
            .catch((err) => console.error(err));
    }, [filterApi, categoryFilterApi, currentCategory.id]);

    const handleCheckboxChange = (filterId) => {
        setCheckboxStates((prevState) => {
            const checkmark = prevState[filterId] === FILTER_FLAGS.EXCLUDE ? '' : FILTER_FLAGS.INCLUDE;
            return {
                ...prevState,
                [filterId]: prevState[filterId] === FILTER_FLAGS.INCLUDE ? FILTER_FLAGS.EXCLUDE : checkmark
            }
        });
    };

    return (
        <div className={styles.filterTab}>
            {filters.map((filter) => (
                <label key={filter.id}>
                    <input
                        className={styles[checkboxStates[filter.id]?.toLowerCase()]}
                        type="checkbox"
                        onChange={() => handleCheckboxChange(filter.id)}
                        checked={checkboxStates[filter.id] === FILTER_FLAGS.INCLUDE}
                    />
                    <span className={styles.checkboxText}>{filter.name}</span>
                </label>
            ))}
        </div>
    );
}

export default FilterContent;