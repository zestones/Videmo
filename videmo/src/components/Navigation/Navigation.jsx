import React, { useState } from "react";

import NavItem from "./Item/NavItem";
import FolderContent from "../FolderContents/FolderContent";
import styles from "./Navigation.module.scss";

function Navigation() {
    const [activeItem, setActiveItem] = useState(('Accueil'));

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    const itemList = {
        Accueil: "Home Content",
        Bibliotheque: "Library Content",
        Explorer: "Extension Content",
        Historique: "History Content",
        Plus: <FolderContent />,
    };

    const renderContent = () => {
        // Render different content based on the active item
        return itemList[activeItem] || null;
    };

    return (
        <div>
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
        </div>
    );
}

export default Navigation;