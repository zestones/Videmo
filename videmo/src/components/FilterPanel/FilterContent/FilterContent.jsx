import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

// Constants
import { FLAGS as FILTER_FLAGS, TYPES as FILTERS_TYPES } from "../../../utilities/utils/Constants";

// Api services
import FilterApi from "../../../services/api/category/FilterApi";
import CategoryFilterApi from "../../../services/api/category/CategoryFilterApi";

// Utilities
import FilterManager from "../../../utilities/filterManager/FilterManager";

// Styles
import styles from "./FilterContent.module.scss";


function FilterContent({ onFilter, currentCategory, series }) {
    // Services initialization
    const categoryFilterApi = useMemo(() => new CategoryFilterApi(), []);
    const filterManager = useMemo(() => new FilterManager(), []);
    const filterApi = useMemo(() => new FilterApi(), []);

    // State initialization
    const [filteredSeries] = useState(series);
    const [checkboxStates, setCheckboxStates] = useState({});
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        filterApi.getAllFiltersEntries()
            .then((filters) => setFilters(filters))
            .catch((err) => console.error(err));

        categoryFilterApi.getFiltersByCategoryId(currentCategory.id)
            .then((filters) => {
                const updatedCheckboxStates = {};
                filters.filter.forEach((filter) => updatedCheckboxStates[filter.id] = filter.flag);
                setCheckboxStates(updatedCheckboxStates);
            })
            .catch((err) => console.error(err));
    }, [filterApi, categoryFilterApi, currentCategory.id]);

    const handleCheckboxChange = (filterId) => {
        const updatedCheckboxStates = { ...checkboxStates };

        if (updatedCheckboxStates[filterId] === FILTER_FLAGS.INCLUDE) updatedCheckboxStates[filterId] = FILTER_FLAGS.EXCLUDE;
        else if (updatedCheckboxStates[filterId] === FILTER_FLAGS.EXCLUDE) updatedCheckboxStates[filterId] = FILTER_FLAGS.NONE;
        else updatedCheckboxStates[filterId] = FILTER_FLAGS.INCLUDE;

        const categoryFilter = { type: FILTERS_TYPES.FILTER, fields: [] }
        categoryFilter.fields.push({ ...filters.find(filter => filter.id === filterId), flag: updatedCheckboxStates[filterId] })
        categoryFilter.fields = filters.map(filter => ({ ...filter, flag: updatedCheckboxStates[filter.id] }));

        categoryFilterApi.updateCategoryFilter(categoryFilter, currentCategory.id);

        setCheckboxStates(updatedCheckboxStates);
        onFilter([...filterManager.filterSeriesByFilters(filteredSeries, categoryFilter.fields)]);
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
};

FilterContent.propTypes = {
    onFilter: PropTypes.func.isRequired,
    currentCategory: PropTypes.object.isRequired,
    series: PropTypes.array.isRequired,
};

export default FilterContent;