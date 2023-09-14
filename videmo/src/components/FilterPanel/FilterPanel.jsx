import React, { useEffect, useState, useMemo } from 'react';

// External
import FilterListIcon from '@mui/icons-material/FilterList';

// Services
import CategoryFilterApi from '../../services/api/category/CategoryFilterApi';
import CategoryApi from '../../services/api/category/CategoryApi';

// Styles
import styles from './FilterPanel.module.scss';

// Components
import SortContent from './SortContent/SortContent';

const FilterPanel = ({ onFilter }) => {
    // Constants initialization
    const TABS_NAME = { FILTER: 'Filter', SORT: 'Sort', DISPLAY: 'Display' };

    // Services initialization
    const categoryFilterApi = useMemo(() => new CategoryFilterApi(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);

    // State initialization
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Filter');
    const [filters, setFilters] = useState([]);
    const [sort, setSort] = useState({});

    useEffect(() => {
        console.log(filters);

        categoryApi.readLastOpenedCategory().then((category) => {
            categoryFilterApi.getFiltersByCategoryId(category.category_id).then((filters) => {
                filters.forEach((filter) => {
                    if (filter.filter_id === null) setSort({ id: filter.sort_id, name: filter.sort_name });
                    else setFilters((filters) => [...filters, { id: filter.filter_id, name: filter.filter_name }]);
                });
            });
        });
    });

    // Function to handle tab click
    const handleTabClick = (tabName) => setActiveTab(tabName);

    return (
        <>
            <button className={styles.filterButton} onClick={() => setOpen(!open)}>
                <FilterListIcon className={styles.filterIcon} />
            </button>

            <div className={`${styles.filterPanel} ${open ? styles.open : ''}`}>
                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.FILTER ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.FILTER)}
                    >
                        Filter
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.SORT ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.SORT)}
                    >
                        Sort
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.DISPLAY ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.DISPLAY)}
                    >
                        Display
                    </div>
                </div>
                <div className={styles.content}>
                    {activeTab === TABS_NAME.FILTER && (
                        <div className={styles.filterTab}>
                            <label>
                                <input type="checkbox" />
                                Téléchargé
                            </label>
                            <label>
                                <input type="checkbox" />
                                Non lus
                            </label>
                            <label>
                                <input type="checkbox" />
                                Commencé
                            </label>
                            <label>
                                <input type="checkbox" />
                                Terminé
                            </label>
                        </div>
                    )}
                    {activeTab === TABS_NAME.SORT && (
                        <SortContent onFilter={onFilter} setSort={setSort} sort={sort} />
                    )}

                    {activeTab === TABS_NAME.DISPLAY && (
                        <div className={styles.displayTab}>
                            {/* Add display content */}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FilterPanel;
