import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((type, message, closable = true) => {
        setNotification({ type, message, closable });
    }, []); // Only recompute when type, message or closable changes

    const hideNotification = () => {
        setNotification(null);
    };

    const contextValue = useMemo(() => {
        return { notification, showNotification, hideNotification };
    }, [notification, showNotification]); // Only recompute when notification changes

    return (
        <NotificationContext.Provider
            value={contextValue}
        >
            {children}
        </NotificationContext.Provider>
    );
}

const useNotification = () => useContext(NotificationContext);

export { NotificationProvider, useNotification };