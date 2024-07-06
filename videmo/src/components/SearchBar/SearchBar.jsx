import React, { useState, useRef, useEffect } from "react";

// External
import SearchIcon from '@mui/icons-material/Search';

// Styles
import styles from "./SearchBar.module.scss";


function SearchBar({ onSearch }) {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef(null);

    const handleSearchIconClick = () => {
        setIsSearchActive(true);
    };

    const handleSearchInputChange = (event) => {
        setSearchValue(event.target.value);
        // TODO : call the search function only if we are in local extension or if we are in the library
        // onSearch(event.target.value);
    };

    const handleSearchInputBlur = () => {
        if (searchValue === "") {
            setIsSearchActive(false);
        }
    };

    const handleSearch = () => {
        onSearch(searchValue);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        if (isSearchActive) {
            inputRef.current.focus();
        }
    }, [isSearchActive]);

    return (
        <div className={styles.searchBar}>
            {isSearchActive && (
                <input
                    ref={inputRef}
                    className={`${styles.searchInput} ${isSearchActive ? styles.active : ""}`}
                    type="text"
                    placeholder="Rechercher"
                    value={searchValue}
                    onChange={handleSearchInputChange}
                    onBlur={handleSearchInputBlur}
                    onKeyDown={handleKeyDown}
                />
            )}

            <button className={styles.searchButton} onClick={handleSearchIconClick}>
                <SearchIcon data-testid="search-icon" className={styles.searchIcon} />
            </button>
        </div>
    );
}

export default SearchBar;
