import React from "react";

// Components
import SearchBar from "../SearchBar/SearchBar";
import BackArrow from "../BackArrow/BackArrow";
import RandomButton from "../RandButton/RandButton";
import DeleteButton from "../DeleteButton/DeleteButton";
import FilterPanel from "../FilterPanel/FilterPanel";

// Styles
import styles from "./Header.module.scss";

function Header({ title, onSearch = null, onRandom = null, onFilter = null, onBack = null, onDelete = null }) {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                {onBack && <BackArrow handleClick={onBack} />}
                <h1>{title}</h1>
            </div>

            <div className={styles.headerRight}>
                {onSearch && <SearchBar onSearch={onSearch} />}
                {onFilter && <FilterPanel onFilter={onFilter} />}
                {onRandom && <RandomButton onClick={onRandom} />}
                {onDelete && <DeleteButton onClick={onDelete} />}
            </div>
        </header>
    );
}

export default Header;