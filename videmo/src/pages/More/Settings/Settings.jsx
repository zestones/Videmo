import React from "react";

// Components
import Dropdown from "../../../components/Dropdown/Dropdown";

// Styles
import styles from "./Settings.module.scss";
import Header from "../../../components/Header/Header";
import SourceSettings from "./SourceSettings/SourceSettings";
import CategorySettings from "./CategorySettings/CategorySettings";


function Settings() {

    return (
        <div className={styles.settings}>
            <Header title="Paramètres" />
            <Dropdown
                title="Manage local sources"
                content={<SourceSettings />}
            />
            <Dropdown
                title="Manage categories"
                content={<CategorySettings />}
            />
        </div>
    );
}

export default Settings;
