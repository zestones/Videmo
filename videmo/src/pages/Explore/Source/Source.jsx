import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";

// Constants
import { SOURCE_STRING } from "../../../utilities/utils/Constants";


// External
import FolderIcon from '@mui/icons-material/Folder';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Services
import ExtensionApi from "../../../services/api/extension/ExtensionApi";

// Utilities
import SortManager from '../../../utilities/sortManager/SortManager';
import SourceManager from "../../../services/api/sources/SourceManager";

// Components
import Header from "../../../components/Header/Header";
import Extension from "./Extension/Extension";
import SeriesDisplay from "../../../components/SeriesDisplay/SeriesDisplay";

// Styles
import styles from "./Source.module.scss";

function Source({ handleSelectedExtension }) {
    // Utilities and services initialization
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);

    // State initialization
    const [extensions, setExtensions] = useState({ local: [], external: [] });
    const [activeTab, setActiveTab] = useState("source");
    const [searchResults, setSearchResults] = useState({});

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => setExtensions({
                local: sortManager.sortByName(data.local), external: sortManager.sortByName(data.external)
            }))
            .catch((error) => console.error(error));
    }, [extensionApi, sortManager]);

    const search = async (value) => {
        if (value === "") return {};
        for (const source of extensions.external) {
            const result = await sourceManager.searchAnime(source, value);
            setSearchResults((prev) => ({ ...prev, [source.id]: result }));
        }
    };

    return (
        <>
            <Header title="Explorer" onSearch={search} />
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

                {(activeTab === "source" && !Object.keys(searchResults).length) && (
                    <Extension
                        extensions={extensions}
                        handleSelectedExtension={handleSelectedExtension}
                    />
                )}

                {(activeTab === "source" && Object.keys(searchResults).length > 0) && (
                    <div className={styles.searchResults}>
                        {Object.keys(searchResults).map((key) => (
                            <div key={key} className={styles.searchResult}>
                                <button className={styles.extensionSearch}>
                                    <FolderIcon className={styles.extensionIcon} />
                                    <h2>{extensions.external.find((ext) => ext.id == key ? ext : null)?.name}</h2>
                                    <ArrowForwardIcon className={styles.arrowIcon} />
                                </button>
                                <ul className={styles.searchResultList}>
                                    {/* TODO: display and handle event of series */}
                                    <SeriesDisplay
                                        linkedSeries={searchResults[key]}
                                        extension={extensions.external.find((ext) => ext.id == key ? ext : null)}
                                        episodes={[]}
                                        serie={null}
                                        onPlayClick={() => { }}
                                        onRefresh={() => { }}
                                        // eslint-disable-next-line no-undef
                                        calledFrom={SOURCE_STRING}
                                        setEpisodes={() => { }}
                                    />

                                </ul>

                            </div>
                        ))}
                    </div>
                )}
            </div >
        </>
    );
}

Source.propTypes = {
    handleSelectedExtension: PropTypes.func.isRequired,
};

export default Source;