import React from "react";

// Styles
import styles from "./NavItem.module.scss";


function NavItem({ entry, item, activeItem, onPageChange }) {

    const handlePageChange = () => {
        console.log('entry', entry);
        onPageChange(entry);
    };

    return (
        <li
            className={`${styles.navItem} ${activeItem === entry ? styles.active : ""}`}
        >
            <div
                className={`${styles.navIconContainer} ${activeItem === entry ? styles.active : ""}`}
                onClick={handlePageChange}
            >
                {<item.icon className={styles.navIcon} />}
            </div>
            <p className={styles.navLabel}>{item.label}</p>
        </li>
    );
}

export default NavItem;