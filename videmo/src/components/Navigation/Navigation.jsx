import React, { useState } from "react";

import NavItem from "./Item/NavItem";
import FolderContent from "../FolderContents/FolderContent";
import styles from "./Navigation.module.scss";

function Navigation() {
    const [activeItem, setActiveItem] = useState(('Accueil'));

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    const renderContent = () => {
        // Render different content based on the active item
        switch (activeItem) {
            case "home":
                return <p>Home Content</p>;
            case "library":
                return <p>Library Content</p>;
            case "extension":
                return <p>Extension Content</p>;
            case "history":
                return <p>History Content</p>;
            case "more":
                return <FolderContent />;
            default:
                return null;
        }
    };

    return (
        <div>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    <NavItem
                        item="Accueil"
                        activeItem={activeItem}
                        handleItemClick={handleItemClick}
                    />
                    <NavItem
                        item="Bibliotheque"
                        activeItem={activeItem}
                        handleItemClick={handleItemClick}
                    />
                    <NavItem
                        item="Explorer"
                        activeItem={activeItem}
                        handleItemClick={handleItemClick}
                    />
                    <NavItem
                        item="Historique"
                        activeItem={activeItem}
                        handleItemClick={handleItemClick}
                    />
                    <NavItem
                        item="Plus"
                        activeItem={activeItem}
                        handleItemClick={handleItemClick}
                    />
                </ul>
            </nav>
            <div className={styles.content}>{renderContent()}</div>
        </div>
    );
}

export default Navigation;