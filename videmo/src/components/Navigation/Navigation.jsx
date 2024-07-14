import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
                <div className={styles.logo}>
                    <h1 className={styles.title}>Videmo</h1>
                </div>

                <div className={styles.divider} />

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

Navigation.propTypes = {
    navItems: PropTypes.object.isRequired,
    activePage: PropTypes.string.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Navigation;
