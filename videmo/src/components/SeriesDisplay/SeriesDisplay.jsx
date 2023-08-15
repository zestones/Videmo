import React from "react";

// Components
import DetailsContainer from "../DetailsContainer/DetailsContainer";
import SerieCard from "../Card/SerieCard/SerieCard";
import EpisodeCard from "../Card/EpisodeCard/EpisodeCard";

// Styles
import styles from "./SeriesDisplay.module.scss";

function SeriesDisplay({ serie, folderContents, episodes, onPlayClick, onRefresh, calledFromExplore }) {

    return (
        <div className={styles.sourceContent}>
            {serie && (
                <DetailsContainer serie={serie} />
            )}

            {folderContents.map((folderContent) => (
                <SerieCard
                    key={folderContent.link}
                    details={folderContent}
                    onPlayClick={onPlayClick}
                    onMoreClick={onRefresh}
                    displayLabel={calledFromExplore}
                />
            ))}

            <div className={styles.episodesContainer}>
                {episodes.map((episode) => (
                    <EpisodeCard key={episode.link} serie={serie} episode={episode} />
                ))}
            </div>
        </div>
    );
}


export default SeriesDisplay;