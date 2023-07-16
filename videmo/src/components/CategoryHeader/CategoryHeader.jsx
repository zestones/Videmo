import React, { useState, useEffect, useRef } from "react";

// Api
import CategoryApi from "../../services/api/category/CategoryApi";

// Styles
import styles from "./CategoryHeader.module.scss";

function CategoryHeader({ selectedCategory, onSelectCategory }) {
    // Variables and refs for the header scroll
    const headerRef = useRef(null);
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    // Api instances
    const [categoryApi] = useState(() => new CategoryApi());

    // States initialization
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        categoryApi.readAllCategories()
        .then((categories) => {
            setCategories(categories)
            // TODO : retrieve the last opened category from db and set it as selected
            onSelectCategory(categories[1]);
        })
        .catch((error) => console.error(error));
    }, [categoryApi, onSelectCategory]);

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

    const handleMouseUp = () => isDragging = false;

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
                        className={`${styles.libraryHeaderButton} ${selectedCategory?.id === category.id ? styles.active : ""}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}


export default CategoryHeader;