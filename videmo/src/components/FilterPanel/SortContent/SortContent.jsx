import React, { useEffect, useState, useMemo } from "react";

// External
import NorthIcon from '@mui/icons-material/North';

// Utilities
import SortManager from "../../../utilities/sortManager/SortManager";

// Styles
import styles from "./SortContent.module.scss";

// Constants
import { FLAGS as SORT_FLAGS } from "../../../utilities/utils/Constants";

function SortContent({ onFilter, setSort, sort }) {
    // Utilities initialization
    const sortManager = useMemo(() => new SortManager(), []);

    const [selectedSort, setSelectedSort] = useState(sort.name);
    const [sortType, setSortType] = useState(SORT_FLAGS.ASC);

    const arrowClassNames = () => styles.sortArrow + ' ' + (sortType === SORT_FLAGS.ASC ? styles.ascending : styles.descending);

    const handleSortOptionClick = (sortOption) => {
        console.log(sort);
        if (selectedSort === sortOption) {
            setSortType(sortType === SORT_FLAGS.ASC ? SORT_FLAGS.DESC : SORT_FLAGS.ASC);
        } else {
            setSelectedSort(sortOption);
            setSortType(SORT_FLAGS.DESC);
        }
    };

    useEffect(() => {
        if (selectedSort === 'Alphabetical') {
            onFilter((data) => [...sortManager.sortStringByKeys(data, sortType === SORT_FLAGS.DESC, "basename", "name")]);
        } else if (selectedSort === 'Date') {
            // TODO : change name of the field in the database to release_date
            onFilter((data) => [...sortManager.sortDates(data, sortType === SORT_FLAGS.DESC, "infos.release_date")]);
        } else if (selectedSort === 'Popularité') {
            // TODO : store only the rating value in the database (without the /10)
            onFilter((data) => {
                return [...data.sort((a, b) => {
                    if (a.infos.rating === null) return 1;
                    if (b.infos.rating === null) return -1;
                    return sortType === SORT_FLAGS.ASC ? parseFloat(a.infos.rating.split('/')[0]) - parseFloat(b.infos.rating.split('/')[0]) : parseFloat(b.infos.rating.split('/')[0]) - parseFloat(a.infos.rating.split('/')[0]);
                })];
            });
        } else if (selectedSort === 'NumberOfEpisodes') {
            onFilter((data) => [...sortManager.sortNumbers(data, sortType === SORT_FLAGS.DESC, "infos.number_of_episodes")]); 
        }
    }, [selectedSort, sortType, onFilter, sortManager]);


    return (
        <div className={styles.sortTab}>
            <div className={styles.row}>
                <div className={`${selectedSort === 'Alphabetical' && arrowClassNames()}`}>
                    {selectedSort === 'Alphabetical' && <NorthIcon />}
                </div>

                <label
                    className={`${selectedSort === 'Alphabetical' ? styles.selectedSort : ''}`}
                    onClick={() => handleSortOptionClick('Alphabetical')}
                >
                    Alphabétiquement
                </label>
            </div>
            <div className={styles.row}>
                <div className={`${selectedSort === 'Date' && arrowClassNames()}`}>
                    {selectedSort === 'Date' && <NorthIcon />}
                </div>
                <label
                    className={`${selectedSort === 'Date' ? styles.selectedSort : ''}`}
                    onClick={() => handleSortOptionClick('Date')}
                >
                    Date
                </label>
            </div>
            <div className={styles.row}>
                <div className={`${selectedSort === 'Popularité' && arrowClassNames()}`}>
                    {selectedSort === 'Popularité' && <NorthIcon />}
                </div>
                <label
                    className={`${selectedSort === 'Popularité' ? styles.selectedSort : ''}`}
                    onClick={() => handleSortOptionClick('Popularité')}
                >
                    Popularité
                </label>
            </div>
            <div className={styles.row}>
                <div className={`${selectedSort === 'NumberOfEpisodes' && arrowClassNames()}`}>
                    {selectedSort === 'NumberOfEpisodes' && <NorthIcon />}
                </div>
                <label
                    className={`${selectedSort === 'NumberOfEpisodes' ? styles.selectedSort : ''}`}
                    onClick={() => handleSortOptionClick('NumberOfEpisodes')}
                >
                    Nombre d'épisodes
                </label>
            </div>
        </div>
    );
}

export default SortContent;