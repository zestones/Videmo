import React from "react";

// import SearchBar from "../SearchBar/SearchBar";

import styles from "./Header.module.scss";


function Header({ children }) {
    return (
        <header className={styles.header}>
            {children}
        </header>
    );
}

export default Header;