import React, { useState } from 'react';
import PropTypes from 'prop-types';

// External
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Styles
import styles from './Dropdown.module.scss';


const Dropdown = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleDropdown = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    return (
        <div role="group" className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
            <div className={styles.dropdownHeader} onClick={handleToggleDropdown}>
                <h2>{title}</h2>
                <KeyboardArrowDownIcon className={styles.openIcon} onClick={() => handleToggleDropdown} />
            </div>
            <div className={styles.dropdownContent}>
                {content}
            </div>
        </div>
    );
};

Dropdown.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
};

export default Dropdown;