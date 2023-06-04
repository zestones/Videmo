import React, { useState } from 'react';

// Components
import NavItem from './Item/NavItem';

// Styles
import styles from './Navigation.module.scss';

function Navigation({ navItems, onPageTitleChange, searchValue }) {
    const [activeItem, setActiveItem] = useState('Accueil');

    const handleItemClick = (item) => {
        setActiveItem(item);
        onPageTitleChange(item); // Invoke the callback with the new title
    };

    const renderContent = () => {
        // Render different content based on the active item
        return navItems[activeItem] || null;
    };

    return (
        <>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {Object.entries(navItems).map(([key, _]) => (
                        <NavItem
                            key={key}
                            item={key}
                            activeItem={activeItem}
                            handleItemClick={handleItemClick}
                        />
                    ))}
                </ul>
            </nav>
            <div className={styles.content}>{renderContent()}</div>
        </>
    );
}


export default Navigation;