import React from 'react';

// Components
import NavItem from './Item/NavItem';

// Styles
import styles from './Navigation.module.scss';

function Navigation({ navItems, onPageTitleChange, activePage }) {

    const handleItemClick = (item) => {
        onPageTitleChange(item); // Invoke the callback with the new title
    };

    const renderContent = () => {
        // Render different content based on the active item
        return navItems[activePage] || null;
    };

    return (
        <>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {Object.entries(navItems).map(([key, _]) => (
                        <NavItem
                            key={key}
                            item={key}
                            activeItem={activePage}
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