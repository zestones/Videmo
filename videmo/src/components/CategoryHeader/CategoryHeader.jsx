import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

// Api
import CategoryApi from "../../services/api/category/CategoryApi";

// Styles
import styles from "./CategoryHeader.module.scss";


function CategoryHeader({ selectedCategory, onSelectCategory, setNavigationHistory }) {
    const headerRef = useRef(null);
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const [categoryApi] = useState(() => new CategoryApi());
    const [categories, setCategories] = useState([]);
    const activeCategoryRef = useRef(null);

    // Define a callback ref to update the activeCategoryRef
    const updateActiveCategoryRef = useCallback((node) => {
        if (node) {
            activeCategoryRef.current = node;
            activeCategoryRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }, []);

    useEffect(() => {
        categoryApi.readAllCategories()
            .then((categories) => setCategories(categories))
            .catch((error) => console.error(error));
    }, [categoryApi]);

    useEffect(() => {
        categoryApi.readLastOpenedCategory()
            .then((lastOpenedCategory) => onSelectCategory(lastOpenedCategory || categories[0]))
            .catch((error) => console.error(error));

    }, [onSelectCategory, categoryApi, categories]);

    const handleSelectCategory = (category) => {
        onSelectCategory(category);
        setNavigationHistory([]);
        categoryApi
            .updateLastOpenedCategory(category.id)
            .catch((error) => console.error(error));
    };

    const handleMouseDown = (event) => {
        isDragging = true;
        startX = event.pageX - headerRef.current.offsetLeft;
        scrollLeft = headerRef.current.scrollLeft;
    };

    const handleMouseMove = (event) => {
        if (!isDragging) return;
        event.preventDefault();

        const x = event.pageX - headerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Adjust the scrolling speed
        headerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => (isDragging = false);

    return (
        <div
            className={styles.libraryHeader}
            ref={headerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className={styles.libraryHeaderButtons}>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        ref={selectedCategory?.id === category.id
                            ? updateActiveCategoryRef
                            : null
                        }
                        className={`${styles.libraryHeaderButton} ${selectedCategory?.id === category.id ? styles.active : ""}`}
                        onClick={() => handleSelectCategory(category)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

CategoryHeader.propTypes = {
    selectedCategory: PropTypes.object,
    onSelectCategory: PropTypes.func,
    setNavigationHistory: PropTypes.func,
};

export default CategoryHeader;
