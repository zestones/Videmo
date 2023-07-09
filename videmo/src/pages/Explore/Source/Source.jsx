import React, { useEffect, useState } from "react";

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Utilities
import SortManager from '../../../utilities/sortManager/sortManager';

// Components
import Header from "../../../components/Header/Header";

// Styles
import styles from "./Source.module.scss";


function Source({ handleSelectedExtension }) {
    // Utilities and services initialization
    const [extensionApi] = useState(() => new ExtensionApi());
    const [sortManager] = useState(() => new SortManager());

    // State initialization
    const [extensions, setExtensions] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => setExtensions(data))
            .catch((error) => console.error(error));
    }, [extensionApi]);

    const handleSearch = (value) => setSearchValue(value);
    const filterExtensions = extensions.filter((extension) => {
        // Filter by search value and map extensions names back to the original array
        return sortManager.filterArrayByString(searchValue, extensions.map((extension) => extension.name)).includes(extension.name)
    });

    return (
        <>
            <Header title="Explore" onSearch={handleSearch} />
            <div className={styles.container}>
                <h3>Source local</h3>
                {filterExtensions.map((extension) => (
                    <div
                        key={extension.id}
                        className={styles.extension}
                        onClick={() => handleSelectedExtension(extension)}>
                        <div className={styles.extensionIcon} >
                            <img src="/icons/local-source.png" alt="Local source" />
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