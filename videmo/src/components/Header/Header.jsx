import React from "react";

// Components
import SearchBar from "../SearchBar/SearchBar";
import BackArrow from "../BackArrow/BackArrow";

import styles from "./Header.module.scss";


function Header({ title, onSearch = null, onRandom = null, onFilter = null, onBack = null }) {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                {onBack && <BackArrow handleClick={onBack} />}
                <h1>{title}</h1>
            </div>

            <div className={styles.headerRight}>
                {onSearch && <SearchBar onSearch={onSearch} />}
                {onRandom && <button onClick={onRandom}>Random</button>}
                {onFilter && <button onClick={onFilter}>Filter</button>}
            </div>
        </header>
    );
}

export default Header;