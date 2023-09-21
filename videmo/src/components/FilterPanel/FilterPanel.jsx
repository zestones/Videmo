import React, { useState } from 'react';

// External
import FilterListIcon from '@mui/icons-material/FilterList';

// Styles
import styles from './FilterPanel.module.scss';

// Components
import SortContent from './SortContent/SortContent';
import DisplayOptions from './DisplayOptions/DisplayOptions';
import FilterContent from './FilterContent/FilterContent';

const FilterPanel = ({ onFilter, series, currentCategory }) => {
    // Constants initialization
    const TABS_NAME = { FILTER: 'Filter', SORT: 'Sort', DISPLAY: 'Display' };

    // State initialization
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState();

    // Function to handle tab click
    const handleTabClick = (tabName) => setActiveTab(tabName);

    const handleFilterPanel = () => {
        setOpen(!open);
        if (!open) setActiveTab(TABS_NAME.FILTER);
        else setActiveTab();
    }

    return (
        <>
            <button className={styles.filterButton} onClick={handleFilterPanel}>
                <FilterListIcon className={styles.filterIcon} />
            </button>

            <div className={`${styles.filterPanel} ${open ? styles.open : ''}`}>
                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.FILTER ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.FILTER)}
                    >
                        Filtres
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.SORT ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.SORT)}
                    >
                        Trier
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === TABS_NAME.DISPLAY ? styles.active : ''}`}
                        onClick={() => handleTabClick(TABS_NAME.DISPLAY)}
                    >
                        Affichage
                    </div>
                </div>
                <div className={styles.content}>
                    {activeTab === TABS_NAME.FILTER && (
                        <FilterContent
                            currentCategory={currentCategory}
                            onFilter={onFilter}
                            series={series}
                        />

                    )}
                    {activeTab === TABS_NAME.SORT && (
                        <SortContent
                            currentCategory={currentCategory}
                            onFilter={onFilter}
                        />
                    )}

                    {activeTab === TABS_NAME.DISPLAY && (
                        <div className={styles.displayTab}>
                            <DisplayOptions />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FilterPanel;
