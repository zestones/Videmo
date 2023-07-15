import React, { useState, useEffect, useCallback } from "react";

// Utilities
import FolderManager from "../../../utilities/folderManager/folderManager";

// Api
import CategoryApi from "../../../services/api/category/CategoryApi";
import SerieApi from "../../../services/api/serie/SerieApi";
import ExtensionsApi from "../../../services/api/extension/ExtensionApi";
import AniList from "../../../services/aniList/aniList";

// Components
import Header from "../../../components/Header/Header";
import SeriesDisplay from "../../../components/SeriesDisplay/SeriesDisplay";


function SourceContent({ searchScope, calledFromExplore, onBackClick }) {
    // Utilities and services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [categoryApi] = useState(() => new CategoryApi());
    const [serieApi] = useState(() => new SerieApi());
    const [extensionApi] = useState(() => new ExtensionsApi());
    const [aniList] = useState(() => new AniList());

    // State initialization
    const [folderContents, setFolderContents] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);

    // Triggered only when called from Explore is true
    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, searchScope)))
            .catch((error) => console.error(error));
    }, [categoryApi, folderManager, searchScope]);

    const retrieveSubSeriesInLibraryByExtension = (data, extension_id) => {
        categoryApi.readAllSeriesInLibraryByExtension(searchScope)
            .then((series) => setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename)))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        if (!calledFromExplore && searchScope !== null) {
            setSerie(null);
            setEpisodes([]);
            serieApi.readAllSeriesByCategory(searchScope.id)
                .then((seriesInLibrary) => setFolderContents(seriesInLibrary.map((serie) => ({ ...serie, inLibrary: true }))))
                .catch((error) => console.error(error));
        }
    }, [serieApi, searchScope, calledFromExplore]);

    useEffect(() => {
        if (calledFromExplore) {
            folderManager.retrieveFolderContents(searchScope.link)
                .then((data) => retrieveSeriesInLibraryByExtension(data.contents))
                .catch((error) => console.error(error));
        }
    }, [folderManager, categoryApi, searchScope, calledFromExplore, retrieveSeriesInLibraryByExtension]);


    const updateContentForLibrary = () => {
        serieApi.readAllSeriesByCategory(searchScope.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary))
            .catch((error) => console.error(error));
    };

    const refreshFolderContents = () => {
        if (calledFromExplore) retrieveSeriesInLibraryByExtension(folderContents);
        else updateContentForLibrary();
    };

    const filterFolders = folderContents.filter((folderContent) =>
        folderManager.retrieveFileName(folderContent.link)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    const handlePlayClickInLibrary = async (link) => {
        try {
            const serie = folderContents.find((serie) => serie.link === link);

            const extension = await extensionApi.readExtensionById(serie.extension_id);
            return extension.link;
        } catch (error) {
            console.error(error);
        }
    };


    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (details) => {
        // retrieve the base link based on the called component
        const baseLink = !calledFromExplore ? await handlePlayClickInLibrary(details.link) : searchScope.link;

        folderManager.retrieveLevel(baseLink, details.link)
            .then((level) => {
                // We search for folders
                checkAndHandleFolderContentsWithExtension(details.link, level, details.extension_id);
                const searchName = details.basename === details.name ? details.basename : details.basename + " " + details.name;
                aniList.searchAnimeDetailsByName(searchName)
                    .then((data) => setSerie({
                        ...details,
                        name: folderManager.retrieveFileName(details.link),
                        extension_id: calledFromExplore ? searchScope.id : details.extension_id,
                        ...data
                    }))
            }).catch((error) => console.error(error));

        // We reset the search value
        setSearchValue("");
    };


    // TODO : Handle remote and local sources
    const checkAndHandleFolderContentsWithExtension = (link, level = 0, extension_id) => {
        folderManager.retrieveFolderContents(link, level)
            .then((data) => {
                if (data.contents.length === 0) {
                    retrieveSeriesEpisodes(link);
                    setFolderContents([]);
                } else {
                    retrieveSubSeriesInLibraryByExtension(data, extension_id);
                    setEpisodes([]);
                }
            })
            .catch((error) => console.error(error));
    };

    // Function to retrieve series episodes
    const retrieveSeriesEpisodes = (path) => {
        folderManager.retrieveFilesInFolder(path)
            .then((data) => setEpisodes(data))
            .catch((error) => console.error(error));
    };

    return (
        <>
            {calledFromExplore ?
                <Header
                    title={searchScope.name}
                    onSearch={setSearchValue}
                    onBack={() => onBackClick(serie, setSerie, checkAndHandleFolderContentsWithExtension)}
                    onRandom={() => folderContents.length > 0 && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                />
                :
                <>
                    <Header
                        title="Bibliothèque"
                        onSearch={setSearchValue}
                    />
                </>
            }

            <SeriesDisplay
                folderContents={filterFolders}
                episodes={episodes}
                serie={serie}
                onPlayClick={handlePlayClick}
                onRefresh={refreshFolderContents}
                calledFromExplore={calledFromExplore}
            />
        </>
    );
}

export default SourceContent;