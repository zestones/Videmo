import React, { useState } from 'react';

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
        <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
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


export default Dropdown;
