import { useEffect, useState } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';

// Components
import NavItem from './Item/NavItem';
import Notification from '../Notification/Notification';

// Styles
import styles from './Navigation.module.scss';


function Navigation({ navItems, activePage, onPageChange }) {

    const [dynamicComponent, setDynamicComponent] = useState(null);
    const { notification, hideNotification } = useNotification();

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
                            key={key}
                            entry={key}
                            item={navItems[key]}
                            activeItem={activePage}
                            onPageChange={onPageChange}
                        />
                    ))}
                </ul>
            </nav>
            <div className={styles.content}>
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        closable={notification.closable}
                        onClose={hideNotification}
                    />
                )}
                {dynamicComponent}
            </div>
        </>
    );
}

export default Navigation;
