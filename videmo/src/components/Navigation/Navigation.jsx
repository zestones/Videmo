import React, { useState } from 'react';

// Components
import NavItem from './Item/NavItem';

// Pages
import Settings from '../../pages/More/Settings/Settings';
import Explore from '../../pages/Explore/Explore';

// Styles
import styles from './Navigation.module.scss';

function Navigation({ onPageTitleChange, searchValue }) {
    const [activeItem, setActiveItem] = useState('Accueil');

    const handleItemClick = (item) => {
        setActiveItem(item);
        onPageTitleChange(item); // Invoke the callback with the new title
    };

    const itemList = {
        Accueil: 'Home Content',
        Bibliotheque: 'Library Content',
        Explorer: <Explore searchValue={searchValue} />,
        Historique: 'History Content',
        Plus: <Settings />,
    };

    const renderContent = () => {
        // Render different content based on the active item
        return itemList[activeItem] || null;
    };

    return (
        <>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {Object.entries(itemList).map(([key, value]) => (
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