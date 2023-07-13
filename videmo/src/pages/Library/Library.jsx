import React, { useState, useCallback } from "react";


// Components
import SourceContent from "../Explore/SourceContent/SourceContent";
import Header from "../../components/Header/Header";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";

// Styles
import styles from "./Library.module.scss";


function Library() {
    // States initialization
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleSelectCategory = useCallback((category) => () => setSelectedCategory(category), []);

    return (
        <>
            <Header title="Library" />
            <div className={styles.library}>
                <div className={styles.libraryContainer}>
                    <CategoryHeader selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
                    <SourceContent
                        searchScope={selectedCategory}
                        calledFromExplore={false}
                    />
                </div>
            </div>
        </>
    );
}

export default Library;