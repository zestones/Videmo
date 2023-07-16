import React, { useState, useEffect, useCallback } from "react";

// Services & Api
import FolderManager from "../../utilities/folderManager/folderManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import AniList from "../../services/aniList/aniList";

// Pages
import Source from "./Source/Source";

// Components
import SeriesDisplay from "../../components/SeriesDisplay/SeriesDisplay";
import Header from "../../components/Header/Header";

function Explore() {
    // State initialization
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [folderContents, setFolderContents] = useState([]);
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    // Utilities and services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [categoryApi] = useState(() => new CategoryApi());

    const [aniList] = useState(() => new AniList());

    const retrieveSeriesInLibraryByExtension = useCallback((contents) => {
        categoryApi.readAllSeriesInLibraryByExtension(selectedExtension)
            .then((series) => setFolderContents(folderManager.mapFolderContentsWithMandatoryFields(contents, series, selectedExtension)))
            .catch((error) => console.error(error));
    }, [categoryApi, folderManager, selectedExtension]);

    useEffect(() => {
        if (!selectedExtension) return;
        folderManager.retrieveFolderContents(selectedExtension.link)
            .then((data) => retrieveSeriesInLibraryByExtension(data.contents))
            .catch((error) => console.error(error));
    }, [folderManager, categoryApi, selectedExtension, retrieveSeriesInLibraryByExtension]);

    const handleBackClick = async () => {
        // If the series is null, then a click on the back button will reset the extension
        if (!serie) return setSelectedExtension(null);

        try {
            // We retrieve the parent path of the current serie and the level of the serie
            const link = await folderManager.retrieveParentPath(serie.link);
            const level = await folderManager.retrieveLevel(selectedExtension.link, link);
            // We search for folders or files based on the extension, the level and the parent path
            checkAndHandleFolderContentsWithExtension(link, level, selectedExtension.id);

            // Then we update the serie with the new data
            let serieUpdates = {};
            if (level === 0) return setSerie(null);
            else {
                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveFileName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };
            }

            // We search for the serie on AniList to retrieve its details
            const searchName = serieUpdates.basename === serieUpdates.name ? serieUpdates.basename : `${serieUpdates.basename} ${serieUpdates.name}`;
            const data = await aniList.searchAnimeDetailsByName(searchName);
            serieUpdates = { ...serieUpdates, ...data };

            setSerie((prevSerie) => ({ ...prevSerie, ...serieUpdates }));
        } catch (error) {
            console.error(error);
        }
    };

    const refreshFolderContents = () => {
        retrieveSeriesInLibraryByExtension(folderContents);
    };

    // When a serie is clicked, retrieve its contents
    const handlePlayClick = async (details) => {
        try {
            const level = await folderManager.retrieveLevel(selectedExtension.link, details.link);
            checkAndHandleFolderContentsWithExtension(details.link, level, details.extension_id);
            const searchName = details.basename === details.name ? details.basename : details.basename + " " + details.name;
            const data = await aniList.searchAnimeDetailsByName(searchName);
            setSerie({
                ...details,
                name: folderManager.retrieveFileName(details.link),
                extension_id: selectedExtension.id,
                ...data
            });
            setSearchValue("");
        } catch (error) {
            console.error(error);
        }
    };

    // TODO : Handle remote and local sources
    const checkAndHandleFolderContentsWithExtension = async (link, level = 0, extension_id) => {
        try {
            const data = await folderManager.retrieveFolderContents(link, level);
            if (data.contents.length === 0) {
                const data = await folderManager.retrieveFilesInFolder(link);
                setEpisodes(data);
                setFolderContents([]);
            } else {
                const series = await categoryApi.readAllSeriesInLibraryByExtension(selectedExtension);
                setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename));
                setEpisodes([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filterFolders = folderContents.filter((folderContent) =>
        folderManager.retrieveFileName(folderContent.link)
            .toLowerCase()
            .includes(searchValue.toLowerCase())
    );

    return (
        <>
            {!selectedExtension ? (
                <Source handleSelectedExtension={setSelectedExtension} />
            ) : (
                <>
                    <Header
                        title={selectedExtension.name}
                        onSearch={setSearchValue}
                        onBack={handleBackClick}
                        onRandom={() => folderContents.length > 0 && handlePlayClick(folderContents[Math.floor(Math.random() * folderContents.length)])}
                    />
                    <SeriesDisplay
                        folderContents={filterFolders}
                        episodes={episodes}
                        serie={serie}
                        onPlayClick={handlePlayClick}
                        onRefresh={refreshFolderContents}
                        calledFromExplore={true}
                    />
                </>
            )}
        </>
    );
}

export default Explore;
