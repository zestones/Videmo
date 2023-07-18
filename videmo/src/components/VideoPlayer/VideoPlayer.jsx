import React, { useState } from "react";

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Utilities
import FolderManager from "../../utilities/folderManager/FolderManager";

// Styles
import styles from "./VideoPlayer.module.scss";


function VideoPlayer({ videoUrl, onShowVideoChange }) {
    const [folderManager] = useState(() => new FolderManager());

    // TODO : change the video player to a custom one

    return (
        <div className={styles.videoPlayer}>
                <video className={styles.videoPlayer__video} controls>
                    <source src={folderManager.accessFileWithCustomProtocol(videoUrl)} type="video/mp4" />;
                </video>

                <div className={styles.videoPlayer__close} onClick={() => onShowVideoChange(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                </div>
        </div>
    );
}

export default VideoPlayer;