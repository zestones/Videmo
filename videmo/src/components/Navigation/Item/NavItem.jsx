import React from "react";
import styles from "./NavItem.module.scss";


function NavItem({ item, activeItem, handleItemClick }) {
    const handleClick = () => {
        handleItemClick(item);
    };

    return (
        <li
            className={`${styles.navItem} ${activeItem === item ? styles.active : ""}`}
            onClick={handleClick}
        >
            <div
                className={`${styles.navIconContainer} ${activeItem === item ? styles.active : ""
                    }`}
            >
                <img className={styles.navIcon} src={`/icons/${item}.png`} alt={item} />
            </div>
            <p className={styles.navLabel}>{item}</p>
        </li>
    );
}

export default NavItem;