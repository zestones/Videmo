import React, { useState, useEffect } from 'react';
import { useNotification } from "../../components/Notification/NotificationProvider";

// External
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
// Api 
import SerieApi from '../../services/api/serie/SerieApi';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './DetailsContainer.module.scss';


const DetailsContainer = ({ serie }) => {
	// State initialization
	const [showModal, setShowModal] = useState(false);
	const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);

	// Initialization of the notification hook
	const { showNotification } = useNotification();

	// Api initialization
	const [serieApi] = useState(() => new SerieApi());

	const details = [
		{ icon: <StarIcon />, label: serie.rating },
		{ icon: <CalendarTodayIcon />, label: serie.startDate },
		{ icon: <WatchLaterIcon />, label: serie.duration },
	];

	useEffect(() => {
		serieApi.readSerieBySerieObject(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie?.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}, [serieApi, serie, showNotification]);

	const refreshSerieState = () => {
		serieApi.readSerieBySerieObject(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}

	return (
		<div className={styles.detailsContainer}>
			<div className={styles.serieBackground} >
				<img className={styles.serieImage} src={serie.image} alt={serie.basename} />
				<div className={styles.serieFavoriteContainer}>
					<span className={styles.serieFavoriteIcon} onClick={() => setShowModal(true)}>
						<FavoriteIcon className={`${styles.serieFavorite} ${alreadyInLibrary ? styles.active : ''}`} />
					</span>
					<p className={styles.serieFavoriteLabel}>Ajouter à ma liste</p>
				</div>
			</div>

			<div className={styles.content}>
				<div className={styles.mainContent}>
					<h2 className={styles.title}>{serie.basename}</h2>
					{serie.basename && serie.basename !== serie.name && (
						<h4 className={styles.subtitle}>{serie.name}</h4>
					)}

					<p className={styles.description} dangerouslySetInnerHTML={{ __html: serie?.description }}></p>

					<div className={styles.genres}>
						{serie?.genres?.map((genre, index) => (
							<span className={styles.genre} key={index}>
								{genre}
							</span>
						))}
					</div>
				</div>

				<div className={styles.serieDetailsInfo}>
					{details.map((item, index) => (
						<div className={styles.serieDetailsInfoItem} key={index}>
							<span className={styles.serieDetailsInfoItemIcon}>{item.icon}</span>
							<span className={styles.serieDetailsInfoItemLabel}>{item.label}</span>
						</div>
					))}
				</div>
			</div>
			{showModal && (
				<CategoryModal
					serie={serie}
					onClose={() => setShowModal(false)}
					onMoreClick={refreshSerieState}
				/>
			)}
		</div>
	);
};

export default DetailsContainer;
