import React, { useState } from "react";

// Services & Api
import FolderManager from "../../utilities/folderManager/folderManager";
import AniList from "../../services/aniList/aniList";

// Pages
import Source from "./Source/Source";
import SourceContent from "./SourceContent/SourceContent";

function Explore() {
    // State initialization
    const [selectedExtension, setSelectedExtension] = useState(null);

    // Utilities and services initialization
    const [folderManager] = useState(() => new FolderManager());
    const [aniList] = useState(() => new AniList());

    const handleSelectedExtension = (extension) => setSelectedExtension(extension);

    const handleBackClick = async (serie, setSerie, checkAndHandleFolderContentsWithExtension) => {
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

    return (
        <>
            {!selectedExtension ? (
                <Source handleSelectedExtension={handleSelectedExtension} />
            ) : (
                <>
                    <SourceContent
                        searchScope={selectedExtension}
                        calledFromExplore={true}
                        onBackClick={handleBackClick}
                        onRandomClick={() => { }}
                    />
                </>
            )}
        </>
    );
}

export default Explore;
