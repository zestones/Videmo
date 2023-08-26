import React, { createContext, useContext, useState, useMemo } from 'react';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message, closable = true) => {
        setNotification({ type, message, closable });
    };

    const hideNotification = () => {
        setNotification(null);
    };

    const contextValue = useMemo(() => {
        return { notification, showNotification, hideNotification };
    }, [notification]); // Only recompute when notification changes

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