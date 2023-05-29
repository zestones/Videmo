import React from "react";

// import SearchBar from "../SearchBar/SearchBar";

import styles from "./Header.module.scss";


function Header({title}) {
    return (
        <header className={styles.header}>
            <h1>{title}</h1>
        </header>
    );
}

export default Header;