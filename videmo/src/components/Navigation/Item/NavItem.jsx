import React from "react";
import PropTypes from "prop-types";

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
                    <p>{item.label}</p>
                </div>
            </li>
        </Tooltip>
    );
}

NavItem.propTypes = {
    entry: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    activeItem: PropTypes.string.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default NavItem;