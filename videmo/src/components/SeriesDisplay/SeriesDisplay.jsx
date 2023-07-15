import React from "react";

// Components
import DetailsContainer from "../../pages/Explore/DetailsContainer/DetailsContainer";
import Card from "../Card/Card";
import EpisodeCard from "../EpisodeCard/EpisodeCard";

// Styles
import styles from "./SeriesDisplay.module.scss";

function SeriesDisplay({ serie, folderContents, episodes, onPlayClick, onRefresh, calledFromExplore }) {
    return (
        <div className={styles.sourceContent}>
            {serie && (
                <DetailsContainer serie={serie} />
            )}

            {folderContents.map((folderContent) => (
                <Card
                    key={folderContent.path}
                    details={folderContent}
                    onPlayClick={onPlayClick}
                    onMoreClick={onRefresh}
                    displayLabel={calledFromExplore}
                />
            ))}
            <div className={styles.episodesContainer}>
                {episodes.map((episode) => (
                    <EpisodeCard
                        title={episode.name}
                        link={episode.path}
                        modifiedTime={episode.modifiedTime}
                    />
                ))}
            </div>
        </div>
    );
}


export default SeriesDisplay;