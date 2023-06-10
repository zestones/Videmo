import React, { useState, useEffect, useCallback } from "react";

// Api
import CategoryApi from "../../services/api/category/CategoryApi";
import SerieApi from "../../services/api/serie/SerieApi";

// Components
import Card from "../../components/Card/Card";

// Styles
import styles from "./Library.module.scss";


function Library({ searchValue }) {
    // States
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [series, setSeries] = useState([]);

    // Api instances
    const [categoryApi] = useState(() => new CategoryApi());
    const [serieApi] = useState(() => new SerieApi());

    const handleSelectCategory = useCallback((category) => () => {
        setSelectedCategory(category);
        serieApi.readAllSeriesByCategory(category.id)
            .then((series) => setSeries(series))
            .catch((error) => console.log(error));
    }, [serieApi]);

    useEffect(() => {
        categoryApi.readAllCategories()
            .then((categories) => {
                setCategories(categories)
                handleSelectCategory(categories[0])();
            })
            .catch((error) => console.log(error));
    }, [categoryApi, handleSelectCategory]);

    // Refresh the series when the category changes
    const refreshSeriesOnSerieCategoryChange = () => {
        serieApi.readAllSeriesByCategory(selectedCategory.id)
            .then((series) => setSeries(series))
            .catch((error) => console.log(error));
    }

    // Sort the series alphabetically
    const alphabeticallySortSeries = series.sort((a, b) => a.name.localeCompare(b.name));

    // Filter the series based on the search value
    const filteredSeriesOnSearch = alphabeticallySortSeries.filter((serie) => serie.name.toLowerCase().includes(searchValue.toLowerCase()));

    // Filter the series based on the search value
    const filteredSeries = searchValue === "" ? alphabeticallySortSeries : filteredSeriesOnSearch;

    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <div className={styles.libraryHeader}>
                    <div className={styles.libraryHeaderButtons}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`${styles.libraryHeaderButton} ${selectedCategory?.id === category.id ? styles.active : ""}`}
                                onClick={handleSelectCategory(category)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.libraryContent}>
                    {selectedCategory && (
                        <div className={styles.libraryContentCategorySeries}>
                            {filteredSeries.map((serie) => (
                                <Card
                                    serie={serie}
                                    onPlayClick={(serie) => console.log(serie)}
                                    onMoreClick={refreshSeriesOnSerieCategoryChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Library;