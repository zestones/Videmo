import React, { useEffect, useState, useMemo } from "react";

// External
import FolderIcon from '@mui/icons-material/Folder';

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Utilities
import SortManager from '../../../utilities/sortManager/SortManager';

// Components
import Header from "../../../components/Header/Header";

// Styles
import styles from "./Source.module.scss";


function Source({ handleSelectedExtension }) {
    // Utilities and services initialization
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);

    // State initialization
    const [localExtensions, setLocalExtensions] = useState([]);
    const [remoteExtensions, setRemoteExtensions] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("local");

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => {
                console.log(data);
                setLocalExtensions(data.local)
                setRemoteExtensions(data.external)
            })
            .catch((error) => console.error(error));
    }, [extensionApi]);

    const handleSearch = (value) => setSearchValue(value);
    const filterExtensions = sortManager.filterByKeyword(searchValue, activeTab === "local" ? localExtensions : remoteExtensions, 'name');

    return (
        <>
            <Header title="Explorer" onSearch={handleSearch} />
            <div className={styles.container}>
                <div className={styles.tabs}>
                    <h3
                        className={`${styles.tab} ${activeTab === "local" ? styles.active : ""}`}
                        onClick={() => setActiveTab("local")}
                    >
                        Source locale
                    </h3>
                    <h3
                        className={`${styles.tab} ${activeTab === "remote" ? styles.active : ""}`}
                        onClick={() => setActiveTab("remote")}
                    >
                        Source externe
                    </h3>
                </div>
                <div className={styles.extensions}>
                    {filterExtensions.map((extension) => (
                        <div
                            key={extension.id}
                            className={styles.extension}
                            onClick={() => handleSelectedExtension(extension)}
                        >
                            <div className={styles.extensionIcon}>
                                <FolderIcon className={activeTab === "local" ? styles.localSource : styles.remoteSource} />
                            </div>
                            <p className={styles.extensionName}>
                                {extension.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Source;