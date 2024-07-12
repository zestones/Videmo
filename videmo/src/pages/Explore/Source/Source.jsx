import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";

// External
import FolderIcon from '@mui/icons-material/Folder';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Utilities
import SortManager from '../../../utilities/sortManager/SortManager';

// Components
import Header from "../../../components/Header/Header";
import Extension from "./Extension/Extension";

// Styles
import styles from "./Source.module.scss";

function Source({ handleSelectedExtension }) {
    // Utilities and services initialization
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);

    // State initialization
    const [extensions, setExtensions] = useState({ local: [] });
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("source");

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => {
                console.log(data);
                data.local = sortManager.sortByName(data.local);
                data.external = sortManager.sortByName(data.external);
                setExtensions(data)
            })
            .catch((error) => console.error(error));
    }, [extensionApi, sortManager]);

    const handleSearch = (value) => setSearchValue(value);

    return (
        <>
            <Header title="Explorer" onSearch={handleSearch} />
            <div className={styles.container}>

                <div className={styles.tabs}>
                    <button className={styles.tab + (activeTab === "source" ? ` ${styles.active}` : "")} onClick={() => setActiveTab("source")}>
                        <FolderIcon className={styles.tabIcon} />
                        <p className={styles.tabText}>Source</p>
                    </button>
                    <button className={styles.tab + (activeTab === "manage" ? ` ${styles.active}` : "")} onClick={() => setActiveTab("manage")}>
                        <MiscellaneousServicesIcon className={styles.tabIcon} />
                        <p className={styles.tabText}>Manage</p>
                    </button>
                </div>

                {activeTab === "source" && (
                    <Extension
                        extensions={extensions}
                        handleSelectedExtension={handleSelectedExtension}
                    />
                )}
            </div>
        </>
    );
}

Source.propTypes = {
    handleSelectedExtension: PropTypes.func.isRequired,
};

export default Source;
