import React from "react";

// Components
import SearchBar from "../SearchBar/SearchBar";
import BackArrow from "../BackArrow/BackArrow";
import RandomButton from "../RandButton/RandButton";
import DeleteButton from "../DeleteButton/DeleteButton";
import FilterPanel from "../FilterPanel/FilterPanel";
import ViewModule from "../ViewModule/ViewModule";
import UpdateButton from "../UpdateButton/UpdateButton";

// Styles
import styles from "./Header.module.scss";

function Header({ title,
    series,
    currentCategory,
    onSearch = null,
    onRandom = null,
    onFilter = null,
    onBack = null,
    onDelete = null,
    onViewMode = null,
    onUpdate = null,
    progress
}) {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                {onBack && <BackArrow handleClick={onBack} />}
                <h1>{title}</h1>
            </div>

            <div className={styles.headerRight}>
                {onSearch && <SearchBar onSearch={onSearch} />}
                {onFilter && <FilterPanel onFilter={onFilter} series={series} currentCategory={currentCategory} />}
                {onRandom && <RandomButton onClick={onRandom} />}
                {onDelete && <DeleteButton onClick={onDelete} />}
                {onViewMode && <ViewModule />}
                {onUpdate && <UpdateButton onClick={onUpdate} progress={progress} />}
            </div>
        </header>
    );
}

export default Header;