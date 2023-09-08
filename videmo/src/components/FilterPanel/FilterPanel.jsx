import React, { useState } from 'react';

// External
import FilterListIcon from '@mui/icons-material/FilterList';
import NorthIcon from '@mui/icons-material/North';

// Styles
import styles from './FilterPanel.module.scss';

const FilterPanel = ({ onFilter }) => {
    // Constants initialization
    const TABS_NAME = { FILTER: 'Filter', SORT: 'Sort', DISPLAY: 'Display' };
    const SORT_TYPES = { ASC: 'asc', DESC: 'desc' };

    // State initialization
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Filter');
    const [selectedSort, setSelectedSort] = useState(null);
    const [sortType, setSortType] = useState(SORT_TYPES.ASC);


    // Function to handle tab click
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setSelectedSort(null);
    };

    // Function to handle sort option click
    const handleSortOptionClick = (sortOption) => {
        if (selectedSort === sortOption) {
            // If the same option is clicked again, toggle the sort type
            setSortType(sortType === SORT_TYPES.ASC ? SORT_TYPES.DESC : SORT_TYPES.ASC);
        } else {
            setSelectedSort(sortOption);
            setSortType(SORT_TYPES.ASC);
        }
    };

    return (
        <>
            <button className={styles.filterButton} onClick={() => setOpen(!open)}>
                <FilterListIcon className={styles.filterIcon} />
            </button>

            <div className={`${styles.filterPanel} ${open ? styles.open : ''}`}>
                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.FILTER ? styles.active : ''
                            }`}
                        onClick={() => handleTabClick(TABS_NAME.FILTER)} // Handle click event
                    >
                        Filter
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.SORT ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.SORT)} // Handle click event
                    >
                        Sort
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.DISPLAY ? styles.active : ''
                            }`}
                        onClick={() => handleTabClick(TABS_NAME.DISPLAY)} // Handle click event
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
                        <div className={styles.sortTab}>
                            <label
                                className={`${selectedSort === 'Alphabetical' ? styles.selectedSort : ''}`}
                                onClick={() => handleSortOptionClick('Alphabetical')}
                            >
                                <div className={`${styles.sortArrow} ${sortType === SORT_TYPES.ASC ? styles.ascending : styles.descending}`}>
                                    <NorthIcon />
                                </div>
                                Alphabétiquement
                            </label>
                        </div>
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
