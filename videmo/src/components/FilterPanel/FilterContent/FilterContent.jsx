import React, { useEffect, useMemo, useState } from "react";


// Constants
import { FLAGS as FILTER_FLAGS, FILTERS_FIELDS } from "../../../utilities/utils/Constants";

// Api services
import FilterApi from "../../../services/api/category/FilterApi";

// Styles
import styles from "./FilterContent.module.scss";


function FilterContent({ currentCategory, onFilter }) {
    // Services initialization
    const filterApi = useMemo(() => new FilterApi(), []);

    // State initialization
    const [checkboxStates, setCheckboxStates] = useState({});
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        filterApi.getAllFiltersEntries()
            .then((filters) => setFilters(filters))
            .catch((err) => console.error(err));
    }, [filterApi]);

    const handleCheckboxChange = (filterId) => {
        setCheckboxStates((prevState) => {
            const checkmark = prevState[filterId] === 'exclude' ? '' : 'include';
            return {
                ...prevState,
                [filterId]: prevState[filterId] === 'include' ? 'exclude' : checkmark
            }
        });
    };

    return (
        <div className={styles.filterTab}>
            {filters.map((filter) => (
                <label key={filter.id}>
                    <input
                        className={styles[checkboxStates[filter.id]]}
                        type="checkbox"
                        onChange={() => handleCheckboxChange(filter.id)}
                        checked={checkboxStates[filter.id] === 'include'}
                    />
                    <span className={styles.checkboxText}>{filter.name}</span>
                </label>
            ))}
        </div>
    );
}

export default FilterContent;