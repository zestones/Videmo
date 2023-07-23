import { useEffect, useState } from 'react';

// Components
import NavItem from './Item/NavItem';

// Styles
import styles from './Navigation.module.scss';


function Navigation({ navItems, activePage, onPageChange }) {

    const [dynamicComponent, setDynamicComponent] = useState(null);

    useEffect(() => {
        // Get the active page object
        const activePageObject = navItems[activePage];

        // Get the active page component
        setDynamicComponent(activePageObject.component);
    }, [activePage, navItems]);

    return (
        <>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {Object.keys(navItems).map((key) => (
                        <NavItem
                            entry={key}
                            item={navItems[key]}
                            activeItem={activePage}
                            onPageChange={onPageChange}
                        />
                    ))}
                </ul>
            </nav>
            <div className={styles.content}>{dynamicComponent}</div>
        </>
    );
}

export default Navigation;
