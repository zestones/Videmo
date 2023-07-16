import React, { useState, useEffect } from "react";

// Api 
import SerieApi from "../../services/api/serie/SerieApi";
import FolderManager from "../../utilities/folderManager/folderManager";
import CategoryApi from "../../services/api/category/CategoryApi";
import ExtensionsApi from "../../services/api/extension/ExtensionApi";
import AniList from "../../services/aniList/aniList";

// Components
import SourceContent from "../Explore/SourceContent/SourceContent";
import CategoryHeader from "../../components/CategoryHeader/CategoryHeader";
import Header from "../../components/Header/Header";

// Styles
import styles from "./Library.module.scss";

function Library() {
    // State initialization
    const [selectedCategory, setSelectedCategory] = useState();
    const [serie, setSerie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [folderContents, setFolderContents] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    // Api initialization
    const [serieApi] = useState(() => new SerieApi());
    const [folderManager] = useState(() => new FolderManager());
    const [categoryApi] = useState(() => new CategoryApi());
    const [extensionApi] = useState(() => new ExtensionsApi());
    const [aniList] = useState(() => new AniList());

    useEffect(() => {
        if (!selectedCategory) return;

        setSerie(null);
        setEpisodes([]);
        serieApi.readAllSeriesByCategory(selectedCategory?.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary.map((serie) => ({ ...serie, inLibrary: true }))))
            .catch((error) => console.error(error));
    }, [serieApi, selectedCategory]);


    const updateContentForLibrary = () => {
        serieApi.readAllSeriesByCategory(selectedCategory.id)
            .then((seriesInLibrary) => setFolderContents(seriesInLibrary))
            .catch((error) => console.error(error));
    };

    const retrieveSubSeriesInLibraryByExtension = (data, extension_id) => {
        categoryApi.readAllSeriesInLibraryByExtension(selectedCategory)
            .then((series) => setFolderContents(folderManager.superMapFolderContentsWithMandatoryFields(data.contents, series, { id: extension_id }, data.basename)))
            .catch((error) => console.error(error));
    };

    // TODO : Mask the arrow when we are at the root of the library
    const onBackClick = async () => {
        // Principle : we take the link of the current serie, 
        // We check if the folder is in the database, if it is, then we are at the root of the library, if not, we are in a subfolder
        // If we are in a subfolder, we retrieve the parent folder of the current folder and we display its content
        // If we are at the root of the library, we display the content of the library
        // We do this until we are at the root of the library
        try {
            const isSerieInLibrary = await serieApi.readSerieBySerieObject(serie);
            if (isSerieInLibrary) {
                updateContentForLibrary();
                setSerie(null);
            } else {
                let serieUpdates = {};
                const link = await folderManager.retrieveParentPath(serie.link);
                const extension = await extensionApi.readExtensionById(serie.extension_id);
                const level = await folderManager.retrieveLevel(extension.link, link);

                const folderContents = await folderManager.retrieveFolderContents(link, level)
                retrieveSubSeriesInLibraryByExtension(folderContents, extension.id)

                const cover = await folderManager.retrieveFolderCover(link, level - 1);
                const basename = await folderManager.retrieveBaseNameByLevel(link, level);
                const name = folderManager.retrieveFileName(link);
                serieUpdates = { ...serieUpdates, ...{ image: cover, basename, name, link } };

                // We search for the serie on AniList to retrieve its details
                const searchName = serieUpdates.basename === serieUpdates.name ? serieUpdates.basename : `${serieUpdates.basename} ${serieUpdates.name}`;
                const data = await aniList.searchAnimeDetailsByName(searchName);
                serieUpdates = { ...serieUpdates, ...data };
                setSerie(serieUpdates);
            }
            setEpisodes([]);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className={styles.library}>
            <div className={styles.libraryContainer}>
                <Header
                    title="Bilbliothèque"
                    onSearch={setSearchValue}
                    onBack={onBackClick}

                />
                <CategoryHeader selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

                <SourceContent
                    searchScope={selectedCategory}
                    calledFromExplore={false}
                    refreshFolderContents={updateContentForLibrary}
                    folderContents={folderContents}
                    setFolderContents={setFolderContents}
                    serie={serie}
                    setSerie={setSerie}
                    episodes={episodes}
                    setEpisodes={setEpisodes}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />
            </div>
        </div>
    );
}

export default Library;