import React from "react";

// Components
import Tooltip from "../../Tooltip/Tooltip";

// Styles
import styles from "./NavItem.module.scss";


function NavItem({ entry, item, activeItem, onPageChange }) {

    return (
        <Tooltip title={item.label} placement="right">
            <li
                className={`${styles.navItem} ${activeItem === entry ? styles.active : ""}`}
                onClick={() => entry !== activeItem && onPageChange(entry)}
            >
                <div className={`${styles.navIconContainer} ${activeItem === entry ? styles.active : ""}`}>
                    {<item.icon className={styles.navIcon} />}
                </div>
            </li>
        </Tooltip>
    );
}

export default NavItem;