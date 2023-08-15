import React, { useState } from "react";

// External components
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DownloadingIcon from '@mui/icons-material/Downloading';

// Components
import Notification from "../../../../components/Notification/Notification";

// Services
import FolderManager from "../../../../utilities/folderManager/FolderManager";

// Styles
import styles from "./BackupSettings.module.scss";

function BackupSettings() {
    // Services initialization
    const [folderManager] = useState(() => new FolderManager());

    // State initialization
    const [error, setError] = useState(null);


    const handleBackupCreation = () => {
        folderManager.createBackup()
            .then(() => setError({ type: "success", message: "Backup created successfully." }))
            .catch(() => setError({ type: "error", message: "Backup creation failed." }));
    }

    const handleBackupRestoration = () => {
        folderManager.restoreBackup()
            .then(() => setError({ type: "success", message: "Backup restored successfully." }))
            .catch(() => setError({ type: "error", message: "Backup restoration failed." }));
    }

    return (
        <div className={styles.container}>
            {error && <Notification type={error.type} message={error.message} onClose={setError} />}
            <div className={styles.backup} onClick={handleBackupCreation}>
                <div className={styles.title}>Create Backup</div>
                <div className={styles.description}>Create a backup of your data and download it to your computer.</div>
                <div className={styles.action}>
                    <CloudDownloadIcon className={styles.icon} />
                    <div className={styles.actionText}>Download</div>
                </div>
            </div>
            <div className={styles.restore} onClick={handleBackupRestoration}>
                <div className={styles.title}>Restore Backup</div>
                <div className={styles.description}>Restore your data from a backup file.</div>
                <div className={styles.action}>
                    <DownloadingIcon className={styles.icon} />
                    <div className={styles.actionText}>Restore</div>
                </div>
            </div>
        </div>
    );
}


export default BackupSettings;
