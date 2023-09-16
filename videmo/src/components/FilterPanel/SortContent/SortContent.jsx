import React, { useEffect, useState, useMemo } from "react";

// External
import NorthIcon from '@mui/icons-material/North';

// Utilities
import SortManager from "../../../utilities/sortManager/SortManager";

// Services
import CategoryFilterApi from "../../../services/api/category/CategoryFilterApi";
import SortApi from "../../../services/api/category/SortApi";

// Constants
import { FLAGS as SORT_FLAGS, TYPES as FILTERS_TYPES } from "../../../utilities/utils/Constants";

// Styles
import styles from "./SortContent.module.scss";


function SortContent({ onFilter, currentCategory }) {
    // Utilities initialization
    const sortManager = useMemo(() => new SortManager(), []);

    // Services initialization
    const categoryFilterApi = useMemo(() => new CategoryFilterApi(), []);
    const sortApi = useMemo(() => new SortApi(), []);

    // State initialization
    const [selectedSortField, setSelectedSortField] = useState();
    const [sortType, setSortType] = useState();
    const [sortsFields, setSortsFields] = useState([]);

    useEffect(() => {
        sortApi.getAllSortsEntries()
            .then((sorts) => setSortsFields(sorts))
            .catch((err) => console.error(err));
        
        categoryFilterApi.getFiltersByCategoryId(currentCategory.id)
            .then((filters) => {
                setSelectedSortField(filters.sort.name);
                setSortType(filters.sort.flag);
            })
            .catch((err) => console.error(err));
    }, [sortApi, categoryFilterApi, currentCategory.id]);

    useEffect(() => {
        onFilter((data) => [...sortManager.sortSeriesByField(data, selectedSortField, sortType)]);
    }, [selectedSortField, sortType, onFilter, sortManager]);

    const arrowClassNames = () => styles.sortArrow + ' ' + (sortType === SORT_FLAGS.ASC ? styles.ascending : styles.descending);

    const handleSortOptionClick = (sortOption) => {
        let flag = SORT_FLAGS.ASC;
        if (selectedSortField === sortOption) flag = sortType === SORT_FLAGS.ASC ? SORT_FLAGS.DESC : SORT_FLAGS.ASC;

        setSelectedSortField(sortOption);
        setSortType(flag);

        categoryFilterApi.updateCategoryFilter({ type: FILTERS_TYPES.SORT, fields: [sortOption], flag: flag }, currentCategory.id);
    };

    return (
        <div className={styles.sortTab}>
            {sortsFields.map((sort) => (
                <div className={styles.row} key={sort.id}>
                    <div className={`${selectedSortField === sort.name && arrowClassNames()}`}>
                        {selectedSortField === sort.name && <NorthIcon />}
                    </div>
                    <label
                        className={`${selectedSortField === sort.name ? styles.selectedSortField : ''}`}
                        onClick={() => handleSortOptionClick(sort.name)}
                    >
                        {sort.name}
                    </label>
                </div>
            ))}
        </div>
    );
}

export default SortContent;