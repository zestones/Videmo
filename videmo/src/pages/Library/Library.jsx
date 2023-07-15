import React, { useState, useEffect, useCallback } from "react";

// Api 
import CategoryApi from "../../services/api/category/CategoryApi";

// Components
import SourceContent from "../Explore/SourceContent/SourceContent";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";

// Styles
import styles from "./Library.module.scss";

function Library() {
    // State initialization
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Api initialization
    const [categoryApi] = useState(() => new CategoryApi());

    const handleSelectCategory = useCallback((category) => () => setSelectedCategory(category), []);

    useEffect(() => {
        // TODO : retrieve the last oppended category
        categoryApi.readAllCategories()
            .then((categories) => setSelectedCategory(categories[1]))
            .catch((error) => console.error(error));
    }, [categoryApi]);

    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <CategoryHeader selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />

                <SourceContent
                    searchScope={selectedCategory}
                    calledFromExplore={false}
                    onBackClick={() => { }}
                />
            </div>
        </div>
    );
}

export default Library;