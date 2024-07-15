import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";

// Hooks
import { useNotification } from "../../../components/Notification/NotificationProvider";

// Constants
import { SOURCE_STRING } from "../../../utilities/utils/Constants";

// External
import FolderIcon from '@mui/icons-material/Folder';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Services
import FolderManager from "../../../utilities/folderManager/FolderManager";
import ExtensionApi from "../../../services/api/extension/ExtensionApi";
import CategoryApi from "../../../services/api/category/CategoryApi";
import TrackApi from "../../../services/api/track/TrackApi";

// Utilities
import SortManager from '../../../utilities/sortManager/SortManager';
import SourceManager from "../../../services/api/sources/SourceManager";

// Components
import Header from "../../../components/Header/Header";
import Extension from "./Extension/Extension";
import SeriesDisplay from "../../../components/SeriesDisplay/SeriesDisplay";

// Socket
import io from 'socket.io-client';

// Styles
import styles from "./Source.module.scss";


function Source({ handleSelectedExtension }) {
    // Utilities and services initialization
    const extensionApi = useMemo(() => new ExtensionApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);
    const sourceManager = useMemo(() => new SourceManager(), []);
    const folderManager = useMemo(() => new FolderManager(), []);
    const categoryApi = useMemo(() => new CategoryApi(), []);
    const trackApi = useMemo(() => new TrackApi(), []);


    // State initialization
    const [extensions, setExtensions] = useState({ local: [], external: [] });
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [searchResults, setSearchResults] = useState({});
    const [activeTab, setActiveTab] = useState("source");
    const [episodes, setEpisodes] = useState([]);
    const [serie, setSerie] = useState(null);


    // Initialization of the notification hook
    const { showNotification } = useNotification();

    useEffect(() => {
        extensionApi.readExtension()
            .then((data) => setExtensions({
                local: sortManager.sortByName(data.local), external: sortManager.sortByName(data.external)
            }))
            .catch((error) => {
                showNotification("error", `Error retrieving extensions: ${error.message}`);
                console.error(error);
            });
    }, [extensionApi, sortManager, showNotification]);

    const search = async (value) => {
        if (value === "") return {};
        for (const source of extensions.external) {
            const result = (await sourceManager.searchAnime(source, value)).map((serie) => ({ ...serie, extension_id: source.id }));
            const series = await categoryApi.readAllSeriesInLibraryByExtension(source);

            const formattedSeries = folderManager.mapFolderContentsWithMandatoryFields(result, series, source);
            fetchAnimeImages(formattedSeries, source);
            setSearchResults((prev) => ({ ...prev, [source.id]: formattedSeries }));
        }

        // TODO : Implement local search
    };

    const handlePlayClick = async (serie) => {
        let extension = extensions.external.find((ext) => (Number(ext.id) === Number(serie.extension_id)) ? ext : null);
        setSelectedExtension(extension);

        if (!extension) {
            extension = extensions.local.find((ext) => (Number(ext.id) === Number(serie.extension_id)) ? ext : null);
            await _handleLocalSourceExtension(serie, extension);
        }

        await _handleRemoteSourceExtension(serie, extension);
    };

    // TODO : fix batch search for local source as there could be tree levels
    const _handleLocalSourceExtension = async (clickedSerie, selectedExtension) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, clickedSerie.link);
            await _retrieveAndSetFolderContents(clickedSerie.link, selectedExtension, level);

            const serie = { ...clickedSerie, name: folderManager.retrieveBaseName(clickedSerie.link), extension_id: selectedExtension.id };
            setSerie(serie);
        } catch (error) {
            console.error(error);
            showNotification("error", `Error retrieving folder contents: ${error.message}`);
        }
    }

    const _handleRemoteSourceExtension = async (clickedSerie, selectedExtension) => {
        try {
            const episodes = await sourceManager.scrapAnimeEpisodes(selectedExtension, clickedSerie.link);
            setEpisodes(episodes);

            const serie = { ...clickedSerie, extension: selectedExtension, extension_id: selectedExtension.id };
            setSerie(serie);
        } catch (error) {
            console.error(error);
            showNotification("error", `Error retrieving episodes: ${error.message}`);
        }
    }

    // TODO : fix batch search for local source as there could be tree levels
    const _retrieveAndSetFolderContents = async (link, selectedExtension, level = 0) => {
        try {
            const data = await folderManager.retrieveFolderContents(link, level);
            if (data.contents.length === 0) {
                const data = await folderManager.retrieveFilesInFolder(link);
                const retrievedEpisodes = await trackApi.readAllEpisodesBySerieLink(link);
                const episodes = trackApi.mapSerieEpisodeWithDatabaseEpisode(data, retrievedEpisodes)

                setEpisodes(episodes);
            } else {
                const series = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                const content = folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: selectedExtension.id }, data.basename);
                setSearchResults({ [selectedExtension.id]: content }); // ? NEEDED
                setEpisodes([]);
            }
        } catch (error) {
            console.error(error);
            showNotification("error", `Error retrieving folder contents: ${error.message}`);
        }
    }

    const refreshFolderContents = (serie) => {
        const updatedSearchResults = { ...searchResults };
        const updatedSerie = { ...serie, inLibrary: true };
        const updatedSeries = updatedSearchResults[serie.extension_id].map((s) => (s.link === serie.link ? updatedSerie : s));

        updatedSearchResults[serie.extension_id] = updatedSeries;
        setSearchResults(updatedSearchResults);
    };

    function updateFetchedSeriesImage(seriesArray, response) {
        return seriesArray.map((serie) => serie.link === response.anime.link
            ? { ...serie, image: response.anime.image }
            : serie);
    }

    const fetchAnimeImages = async (animeList, extension) => {
        if (extension.name !== 'FrenchAnime' && extension.name !== 'AnimesUltra') return;

        const socket = io('http://localhost:4000');

        socket.on('connect', () => {
            socket.emit('get-images', { animes: animeList, referer: extension.link });
        });

        socket.on('image-update', (response) => {
            setSearchResults((prev) => {
                const updatedSeries = updateFetchedSeriesImage(prev[extension.id], response);
                return { ...prev, [extension.id]: updatedSeries }
            });

        });

        return () => {
            socket.disconnect();
        };
    }

    const handleBackClick = () => {
        if (serie) {
            setSerie(null);
            setEpisodes([]);
        } else if (!serie && searchResults) {
            setSearchResults({});
        }
    };

    return (
        <>
            <Header title="Explorer" onSearch={search} onBack={(Object.keys(searchResults).length > 0 || serie) ? handleBackClick : null} />
            <div className={styles.container}>
                {!serie && (
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
                )}

                {(activeTab === "source" && !Object.keys(searchResults).length) && (
                    <Extension
                        extensions={extensions}
                        handleSelectedExtension={handleSelectedExtension}
                    />
                )}

                {(activeTab === "source" && Object.keys(searchResults).length > 0) && (
                    <div className={styles.searchResults}>
                        {!serie ? (
                            Object.keys(searchResults).map((key) => (
                                <div key={key} className={styles.searchResult}>
                                    <button className={styles.extensionSearch}>
                                        <FolderIcon className={styles.extensionIcon} />
                                        <h2>{extensions.external.find((ext) => Number(ext.id) === Number(key) ? ext : null)?.name}</h2>
                                        <ArrowForwardIcon className={styles.arrowIcon} />
                                    </button>
                                    <ul className={styles.searchResultList}>
                                        <SeriesDisplay
                                            linkedSeries={searchResults[key]}
                                            extension={extensions.external.find((ext) => Number(ext.id) === Number(key) ? ext : null)}
                                            episodes={episodes}
                                            serie={serie}
                                            onPlayClick={handlePlayClick}
                                            onRefresh={refreshFolderContents}
                                            calledFrom={SOURCE_STRING}
                                            setEpisodes={setEpisodes}
                                        />
                                    </ul>

                                </div>
                            ))
                        ) : (
                            <SeriesDisplay
                                linkedSeries={[]}
                                extension={selectedExtension}
                                episodes={episodes}
                                serie={serie}
                                onPlayClick={handlePlayClick}
                                onRefresh={refreshFolderContents}
                                calledFrom={SOURCE_STRING}
                                setEpisodes={setEpisodes}
                            />
                        )}
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