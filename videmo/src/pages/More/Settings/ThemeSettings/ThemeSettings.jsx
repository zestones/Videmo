import React, { useEffect, useState, useMemo } from "react";

// External components
import VerifiedIcon from '@mui/icons-material/Verified';

// Api
import ThemeApi from "../../../../services/api/theme/ThemeApi";
import { useTheme } from './ThemeContext';

// Styles
import styles from "./ThemeSettings.module.scss";


function ThemeSettings() {
    // State initialization
    const [themes, setThemes] = useState([]);
    const { updateTheme } = useTheme();


    // Api initialization
    const themeApi = useMemo(() => new ThemeApi(), []);

    useEffect(() => {
        // Get the list of themes from the database
        themeApi.readAllThemes()
            .then((data) => setThemes(data))
            .catch((error) => console.error(error));
    }, [themeApi]);

    const updateActiveTheme = (themeId) => {
        themeApi.updateActiveTheme(themeId, true)
            .then(() => {
                setThemes(themes.map(theme => theme.id === themeId ? { ...theme, is_active: true } : { ...theme, is_active: false }))
                updateTheme(themes.find(theme => theme.id === themeId).name);
            })
            .catch((error) => console.error(error));
    };

    return (
        <div className={styles.themeSettings}>
            <div className={styles.themes}>
                {themes.map((theme) => (
                    <div
                        key={theme.id}
                        className={`${styles.themeCard} ${theme.name}`}
                    >
                        <div
                            className={`${styles.cardContent} ${theme.is_active ? styles.active : ""}`}
                            onClick={() => updateActiveTheme(theme.id)}
                        >
                            {theme.is_active && <div className={styles.activeTheme}> <VerifiedIcon /> </div>}
                            <div className={styles.body}>
                                <div className={styles.header}></div>
                                <div className={styles.navigation}></div>
                                <div className={styles.content}>
                                    <div className={styles.serieCard}>
                                        <span className={styles.label1}></span>
                                        <span className={styles.label2}></span>
                                    </div>
                                    <div className={styles.serieCard}>
                                        <span className={styles.label1}></span>
                                        <span className={styles.label2}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.themeName}>{theme.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ThemeSettings;