import React from "react";

// Components
import Dropdown from "../../../components/Dropdown/Dropdown";
import Header from "../../../components/Header/Header";
import SourceSettings from "./SourceSettings/SourceSettings";
import CategorySettings from "./CategorySettings/CategorySettings";
import BackupSettings from "./BackupSettings/BackupSettings";
import ThemeSettings from "./ThemeSettings/ThemeSettings";

// Styles
import styles from "./Settings.module.scss";


function Settings() {

    return (
        <div className={styles.settings}>
            <Header title="Paramètres" />
            <Dropdown title="Gérer les sources locales" content={<SourceSettings />} />
            <Dropdown title="Gérer les catégories" content={<CategorySettings />} />
            <Dropdown title="Sauvegarde" content={<BackupSettings />} />
            <Dropdown title="Thème" content={<ThemeSettings />} />
        </div>
    );
}

export default Settings;
