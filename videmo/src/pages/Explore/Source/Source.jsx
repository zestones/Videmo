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
    const [extensions, setExtensions] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => console.error(error));
    }, [extensionApi]);

    const handleSearch = (value) => setSearchValue(value);
    const filterExtensions = sortManager.filterByKeyword(searchValue, extensions, 'name');
 
    return (
        <>
            <Header title="Explorer" onSearch={handleSearch} />
            <div className={styles.container}>
                <h3>Source local</h3>
                {filterExtensions.map((extension) => (
                    <div
                        key={extension.id}
                        className={styles.extension}
                        onClick={() => handleSelectedExtension(extension)}>
                        <div className={styles.extensionIcon}>
                            <FolderIcon className={styles.localSource} />
                            </div>
                        <p className={styles.extensionName}>
                            {extension.name}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Source;