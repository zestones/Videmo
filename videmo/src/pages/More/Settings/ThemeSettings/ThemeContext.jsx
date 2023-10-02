import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import ThemeApi from '../../../../services/api/theme/ThemeApi';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(); // No need to set an initial theme here
    const themeApi = useMemo(() => new ThemeApi(), []);

    useEffect(() => {
        // Retrieve the initial theme when the component mounts
        themeApi
            .readActiveTheme()
            .then((theme) => setTheme(theme))
            .catch((err) => console.error(err));
    }, [themeApi]);

    const updateTheme = (newTheme) => setTheme(newTheme);
    const value = useMemo(() => ({ theme, updateTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
