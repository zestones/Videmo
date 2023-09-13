import React, { useState } from 'react';

// External
import FilterListIcon from '@mui/icons-material/FilterList';

// Styles
import styles from './FilterPanel.module.scss';

// Components
import SortContent from './SortContent/SortContent';

// Constants
export const SORT_TYPES = { ASC: 'asc', DESC: 'desc' };


const FilterPanel = ({ onFilter }) => {
    // Constants initialization
    const TABS_NAME = { FILTER: 'Filter', SORT: 'Sort', DISPLAY: 'Display' };

    // State initialization
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Filter');

    // Function to handle tab click
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
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
                        <SortContent
                            onFilter={onFilter}
                        />

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
