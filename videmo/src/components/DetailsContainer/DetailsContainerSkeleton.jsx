import React from "react";

// External
import { Skeleton } from '@mui/material';

// Styles
import styles from './DetailsContainer.module.scss';


function DetailsContainerSkeleton({ children, isLoading }) {
    if (isLoading) {
        return (
            <>
                <div className={styles.serieBackground}>
                    <Skeleton variant="rectangular" className={styles.serieImage} />
                    <div className={styles.serieFavoriteContainer}>
                        <Skeleton variant="circle" className={styles.serieFavoriteIcon} />
                        <Skeleton variant="text" width={125} height={40} className={styles.serieFavoriteLabel} />
                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.mainContent}>
                        <Skeleton variant="text" height={60} className={styles.title} />
                        <Skeleton variant="text" height={40} width={200} className={styles.subtitle} />
                        <Skeleton variant="text" height={200} className={styles.description} />
                        <div className={styles.genres}>
                            <Skeleton variant="text" width={70} height={45} className={styles.genre} />
                            <Skeleton variant="text" width={70} height={45} className={styles.genre} />
                            <Skeleton variant="text" width={70} height={45} className={styles.genre} />
                        </div>
                    </div>
                    <div className={styles.serieDetailsInfo}>
                        <div className={styles.serieDetailsInfoItem}>
                            <Skeleton variant="rectangle" height={30} width={30} className={styles.serieDetailsInfoItemIcon} />
                            <Skeleton variant="text" width={50} className={styles.serieDetailsInfoItemLabel} />
                        </div>
                        <div className={styles.serieDetailsInfoItem}>
                            <Skeleton variant="rectangle" height={30} width={30} className={styles.serieDetailsInfoItemIcon} />
                            <Skeleton variant="text" width={50} className={styles.serieDetailsInfoItemLabel} />
                        </div>
                        <div className={styles.serieDetailsInfoItem}>
                            <Skeleton variant="rectangle" height={30} width={30} className={styles.serieDetailsInfoItemIcon} />
                            <Skeleton variant="text" width={50} className={styles.serieDetailsInfoItemLabel} />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return <>{children}</>;
}

export default DetailsContainerSkeleton;